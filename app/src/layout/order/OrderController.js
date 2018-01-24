app
    .controller('OrderController', ['$scope', '$location','$rootScope', '$timeout','$http', function($scope, $location,$rootScope, $timeout, $http) {



        //Views flags
        $scope.step1 = true;//add prod view
        $scope.step2 = false;//loading view
        $scope.step3 = false;//finished view
        $scope.toolbarSelected = 'order-start';

        //Products Collection
        $scope.productsList = [];

        //Client Collection
        $scope.clientList = [];
        $scope.clientSelected = undefined;
        $scope.loadingClients = false;

        $scope.synching = false;

        //for test
        /*$scope.product1 = {ref: 'a001', qtt:1};
        $scope.product2 = {ref: 'b001', qtt:2};
        $scope.product3 = {ref: 'a001', qtt:1};
        $scope.product4 = {ref: 'b001', qtt:2};
        $scope.product5 = {ref: 'a001', qtt:1};
        $scope.product6 = {ref: 'b001', qtt:2};
        $scope.productsList.push($scope.product1);
        $scope.productsList.push($scope.product2);
        $scope.productsList.push($scope.product3);
        $scope.productsList.push($scope.product4);
        $scope.productsList.push($scope.product5);
        $scope.productsList.push($scope.product6);*/

        /*$scope.client1 = {nome : 'Miguel' , no : 1};
        $scope.client2 = {nome : 'Jõao' , no : 2};
        $scope.clientList.push($scope.client1);
        $scope.clientList.push($scope.client2);*/

        $scope.errorMsg = "";



        //check if it is in cache - configured
        var cachedObject =  localStorage.getItem('credentials');
        if ( cachedObject){
            $scope.step0 = false; //config needed
            $scope.stepChoose = true;//choose client
            $scope.step1 = false;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order-start';

        }else{
            $scope.step0 = true; //config needed
            $scope.stepChoose = false;//choose client
            $scope.step1 = false;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order-config';
        }

        //after "add new product" and then decoded
        $scope.afterDecode = function (codeResult){

            $scope.errorMsg = "";
            var cachedObject =  localStorage.getItem('credentials');
            if ( cachedObject ){
                var credentials = JSON.parse(cachedObject);

                //#2 - Prepare params to get_refs_by_code WS
                var paramsServer = {
                    credentials: credentials,
                    codeBar : codeResult
                };

                $scope.synching = true;

                //#3 - Make the Call!!
                $http.post('../server/get_refs_by_code.php', paramsServer)
                    .success(function(data) {
                        $scope.synching = false;

                        //result
                        console.log(data);
                        if(data.lote){
                            //fulfill server result
                            var lote = data.lote;
                            var meioTab = data.meioTabuleiro;
                            var qttSold = parseFloat(data.qttSold);

                            //Start processing result
                            var preOrderList = lote.u6526_lotes_reservas || [];
                            var totalReserved = 0; //counter to see total of tabuleiros reserved (used in case of Final Consumer)
                            var productToAdd = undefined;

                            //#1 - Iterate reservations
                            preOrderList.forEach(function(reservation) {
                                if(reservation.no.toString() === $scope.clientSelected && reservation.provided === false){
                                    //means that client has a reservation and it is not provided yet
                                    productToAdd = {
                                      design : lote.design,
                                      ref : lote.ref,
                                      qtt : reservation.qttreservada,
                                      litem: lote.codebar,
                                      half : false
                                    };
                                }else{
                                    if(reservation.provided === false){
                                        //only count reservation left not provided
                                        totalReserved = totalReserved + reservation.qttreservada;
                                    }

                                }
                            });

                            //#1.1 - means that this client doesnt have a reservation
                            productToAdd = productToAdd || {design : lote.design, litem:lote.codebar, ref:lote.ref, qtt : (lote.qtt - qttSold - totalReserved),half : false  };


                            //#2 - Store product into order
                            $scope.productsList.push(productToAdd);

                            //#2 - Store half tabuleiro
                            if(meioTab && meioTab.ref !== ''){
                                $scope.productsList.push({design : meioTab.design, ref:meioTab.ref, qtt : 0 ,litem: lote.codebar,half : true});
                            }

                            //#3 - reset input file
                            var input = document.querySelector("input[type=file]");
                            input.value = "";


                        }else{
                            $scope.errorMsg = "Lote não encontrado no Drive FX";
                            $scope.initQuagga();
                        }



                    })
                    .error(function(data) {
                        $scope.synching = false;
                        $scope.errorMsg = "Lote não encontrado no Drive FX";
                        console.log('Error: ' + data);
                    });

            }


        };

        //on Remove product from list
        $scope.removeProduct = function (ref){

            for (var i = 0; i < $scope.productsList.length; i++){
                if($scope.productsList[i].ref === ref){
                    $scope.productsList.splice(i, 1);
                }
            }

        };


        //CHECK IF IT IS to CONTINUE PENDING OR NOT
        if($rootScope.invoicePending){
            $scope.invoicePending = $rootScope.invoicePending;
            $rootScope.invoicePending = undefined;
            console.log("pending invoice");

            $scope.step0 = false; //config needed
            $scope.stepChoose = false;//choose client
            $scope.step1 = true;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order';

            //extract the client Number
            $scope.clientSelected = $scope.invoicePending.no;


            //prepare invoice
            $scope.invoicePending.fis.forEach(function(productLine) {
                if(productLine.ref !== ''){
                    $scope.productsList.push({ref: productLine.ref,litem: productLine.litem, design: productLine.design, qtt: productLine.qtt, original:true});
                }
            });

        }

        //for toolbar stepChoose
        $scope.onStartingOrder = function(){
            $scope.clientSelected = $('#clientInput').val();
            //TODO validate if client is choosed
            $scope.step0 = false; //config needed
            $scope.stepChoose = false;//choose client
            $scope.step1 = true;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order';

        }

        //load clients from Drive FX
        $scope.fetchClients = function () {

            var cachedObject =  localStorage.getItem('credentials');
            if ( cachedObject ){
                var credentials = JSON.parse(cachedObject);

                //#2 - Prepare params to creation_invoice WS
                var paramsServer = {
                    credentials: credentials
                };

                $scope.synching = true;

                //#3 - Make the Call!!
                $http.post('../server/fetch_clients.php', paramsServer)
                    .success(function(data) {
                        $scope.loadingClients = false;
                        $scope.synching = false;

                        //result
                        console.log(data);
                        if(data.result.length > 0){
                            $scope.clientList = data.result;
                            //Start Up Semantic UI dropdown for clients
                            jQuery(document).ready(function() {
                                $('.ui.dropdown').dropdown();

                            });
                        }else{
                            //TODO - Message in case of an error
                        }



                    })
                    .error(function(data) {
                        $scope.synching = false;
                        $scope.loadingClients = false;
                        console.log('Error: ' + data);
                    });

            }



        };

        //In case that stepChoose is active an there's no clients then load
        if($scope.stepChoose || $scope.clientList.length === 0 ){
            $scope.loadingClients = true;

            $scope.fetchClients();
        }else{
            $scope.loadingClients = false;
        }

        /**
         * Bar code matters
         */

        //check if getUserMedia is available
        if(navigator.getUserMedia){
            $scope.liveStreamAvailable = true;
        }

        $scope.onAddNewProduct = function (){

            if($scope.liveStreamAvailable){

                $scope.initQuagga();

            }else{

                console.log('adding...');
                //simmulate the "choose file" button
                var input = document.querySelector("input[type=file]");
                input.click();
            }


        };


        $scope.onResetAll = function (){
            console.log('resetting...');
            $scope.productsList = [];
            $scope.errorMsg = "";

            $scope.clientSelected = undefined;
            $('#clientInput').val("");
            $('#clientLabel').empty();

            $scope.toolbarSelected = 'order';
            $scope.step0 = false; //config needed
            $scope.stepChoose = true;//choose client
            $scope.step1 = false;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order-start';
        };


        $scope.onFinishInvoice = function (){
            //finish a pending one
            if($scope.invoicePending){

                //for test
                //$scope.product1 = {ref: 'b001', qtt:2};
                //$scope.productsList.push($scope.product1);
                $scope.invoicePending.fis = [];//reset original fis and add new ones
                $scope.productsList.forEach(function(productLine){

                    //if(!productLine.original){
                    $scope.invoicePending.fis.push({ref: productLine.ref, qtt:productLine.qtt});
                    //}

                });

                console.log($scope.invoicePending);

                //#1 - Get credentials to connect to Drive
                var cachedObject =  localStorage.getItem('credentials');
                if ( cachedObject ){
                    var credentials = JSON.parse(cachedObject);


                    //#2 - Prepare params to creation_invoice WS
                    var paramsServer = {
                        credentials: credentials,
                        invoice: $scope.invoicePending,
                        option: 0//print options
                    };

                    $scope.step0 = false; //config needed
                    $scope.stepChoose = false;//choose client
                    $scope.step1 = false;//add prod view
                    $scope.step2 = true;//loading view
                    $scope.step3 = false;//finished view

                    //#3 - Make the Call!!
                    $http.post('../server/continue_pending.php', paramsServer)
                        .success(function(data) {

                            //result
                            console.log(data);

                            if(angular.isString(data) && data !== ' '){
                                //show error and then back to order view
                                $scope.errorMsg = data;
                                $scope.step0 = false; //config needed
                                $scope.step1 = true;//add prod view
                                $scope.step2 = false;//loading view
                                $scope.step3 = false;//finished view
                                $scope.toolbarSelected = 'order';
                            }else{
                                $scope.errorMsg = "";
                                //Created!
                                $scope.step0 = false; //config needed
                                $scope.step1 = false;//add prod view
                                $scope.step2 = false;//loading view
                                $scope.step3 = true;//finished view
                                $scope.toolbarSelected = 'order-reset';
                                $scope.invoicePending = undefined;
                            }



                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                        });

                }else{
                    $scope.step0 = false; //config needed
                    $scope.stepChoose = true;//choose client
                    $scope.step1 = false;//add prod view
                    $scope.step2 = false;//loading view
                    $scope.step3 = false;//finished view


                }


                //end of continue

            }else{
                console.log('finishing invoice...');

                //#1 - Get credentials to connect to Drive
                var cachedObject =  localStorage.getItem('credentials');
                if ( cachedObject ){
                    var credentials = JSON.parse(cachedObject);
                    var docType = credentials.docType;

                    //#2 - Prepare params to creation_invoice WS
                    var paramsServer = {
                        credentials: credentials,
                        clientNo : $scope.clientSelected,
                        products: $scope.productsList,
                        docType: docType,
                        option: 0//print options
                    };

                    $scope.step0 = false; //config needed
                    $scope.stepChoose = false;//choose client
                    $scope.step1 = false;//add prod view
                    $scope.step2 = true;//loading view
                    $scope.step3 = false;//finished view

                    //#3 - Make the Call!!
                    $http.post('../server/create_invoice.php', paramsServer)
                        .success(function(data) {

                            //result
                            console.log(data);

                            if(angular.isString(data) && data !== ' '){
                                //show error and then back to order view
                                $scope.errorMsg = data;
                                $scope.step0 = false; //config needed
                                $scope.stepChoose = false;//choose client
                                $scope.step1 = true;//add prod view
                                $scope.step2 = false;//loading view
                                $scope.step3 = false;//finished view
                                $scope.toolbarSelected = 'order';
                            }else{
                                $scope.errorMsg = "";
                                //Created!
                                $scope.step0 = false; //config needed
                                $scope.stepChoose = false;//choose client
                                $scope.step1 = false;//add prod view
                                $scope.step2 = false;//loading view
                                $scope.step3 = true;//finished view
                                $scope.toolbarSelected = 'order-reset';
                            }



                        })
                        .error(function(data) {
                            console.log('Error: ' + data);
                        });

                }else{
                    $scope.step0 = false; //config needed
                    $scope.stepChoose = true;//choose client
                    $scope.step1 = false;//add prod view
                    $scope.step2 = false;//loading view
                    $scope.step3 = false;//finished view
                    $scope.toolbarSelected = 'order-start';


                }
            }


        };

        /**
         *
         * CODE BAR
         *
         */
        $scope.lastResult = undefined;

        /**
         * To check out the Live Stream Option
         * Go to View2Controller
         */

        $scope.initQuagga = function() {
            $scope.liveIsReady = true;
            Quagga.init({
                inputStream : {
                    name : "Live",
                    type : "LiveStream",
                    target: document.querySelector('#interactive-live')    // Or '#yourElement' (optional)
                },
                decoder : {
                    readers : ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
                }
            }, function(err) {
                if (err) {
                    console.log(err);
                    return
                }

                console.log("Initialization finished. Ready to start");
                Quagga.start();
            });
        };

        //When file is taken from camera or Src
        $scope.imageUploaded = function (e){
            $scope.decodeQuagga(URL.createObjectURL(e.files[0]));
        };

        //run de decoder!
        $scope.decodeQuagga = function(src) {
            Quagga.decodeSingle({
                src: src,
                numOfWorkers: 0,  // Needs to be 0 when used within node
                inputStream: {
                    size: 800  // restrict input-size to be 800px in width (long-side)
                },
                decoder: {
                    readers : ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
                },
            }, function(result) {
                if(result.codeResult) {
                    console.log("result", result.codeResult.code);
                    $scope.afterDecode(result.codeResult.code);

                } else {
                    console.log("not detected");
                }
            });



        };

        //Quaggajs processes---
        Quagga.onProcessed(function(result) {
            var drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay,
                area;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                    result.boxes.filter(function (box) {
                        return box !== result.box;
                    }).forEach(function (box) {
                        Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                    });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
                }

            }
        });

        Quagga.onDetected(function(result) {
            //diference between live and photo
            if($scope.liveStreamAvailable){

                var code = result.codeResult.code;

                if ($scope.lastResult !== code) {
                    $scope.lastResult = code;
                    var $node = null, canvas = Quagga.canvas.dom.image;

                    var objDiv = document.getElementById("interactive-live");
                    //objDiv.scrollTop = objDiv.scrollHeight;
                    $("#interactive-live").scrollTop($("#interactive-live")[0].scrollHeight);


                    $scope.afterDecode(code);
                    Quagga.stop();//stop after decode
                    //console.log(result.codeResult);


                    $node = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
                    $node.find("img").attr("src", canvas.toDataURL());
                    $node.find("h4.code").html(code);
                    $("#result_strip ul.thumbnails").prepend($node);
                }


            }else{
                var code = result.codeResult.code,
                    $node,
                    canvas = Quagga.canvas.dom.image;

                $node = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');
                $node.find("img").attr("src", canvas.toDataURL());
                $node.find("h4.code").html(code);
                $("#result_strip ul.thumbnails").prepend($node);
            }


        });


    }]);