app
    .controller('TreatmentController', ['$scope', '$location','$rootScope', '$timeout', '$http', function($scope, $location,$rootScope, $timeout, $http) {

        $scope.toolbarSelected = 'treatment';
        $scope.lotePicked = false;
        $scope.errorMsg = "";
        $scope.treatmentText = "";
        $scope.loteItem = undefined;

        $scope.view = 'step0';

        $scope.synching = false;


        //check if it is in cache
        var cachedObject =  localStorage.getItem('credentials');
        if ( cachedObject ){
            $scope.credentials = JSON.parse(cachedObject);
            //view variables
            $scope.backendUrl = $scope.credentials.backendUrl;
            $scope.appId = $scope.credentials.appId;
            $scope.username = $scope.credentials.username;
            $scope.password = $scope.credentials.password;
            $scope.company = $scope.credentials.company;

            $scope.docType = $scope.credentials.docType;

            //we assume that is correct - NOT bullet proof
            $scope.mustConfig = false;
            $scope.toolbarSelected = 'treatment';


        }else{
            $scope.toolbarSelected = 'treatment-config';
            $scope.mustConfig = true;
        }


        $scope.afterDecode = function (codeResult){

            $timeout( function(){

                $scope.onResetTreat();

                $scope.lotePicked = true;

                var cachedObject =  localStorage.getItem('credentials');
                if ( cachedObject ) {
                    var credentials = JSON.parse(cachedObject);

                    //#2 - Prepare params to get_refs_by_code WS
                    var paramsServer = {
                        credentials: credentials,
                        codeBar: codeResult
                    };

                    $scope.synching = true;
                    //#3 - Make the Call!!
                    $http.post('../server/get_lote_treatment.php', paramsServer)
                        .success(function(data) {
                            $scope.synching = false;
                            //result
                            console.log(data);
                            if(data.lote){
                                //fulfill server result
                                $scope.loteItem = data.lote;

                                //#3 - reset input file
                                var input = document.querySelector("input[type=file]");
                                input.value = "";


                            }else{
                                $scope.errorMsg = "Lote não encontrado no Drive FX";
                            }



                        })
                        .error(function(data) {
                            $scope.synching = false;
                            $scope.errorMsg = "Lote não encontrado no Drive FX";
                            console.log('Error: ' + data);
                        });


                }


            });//timeout for compile
        };

        //check if getUserMedia is available
        if(navigator.getUserMedia){
            $scope.liveStreamAvailable = true;
        }

        $scope.onPickNewLote = function (){

            if($scope.liveStreamAvailable){

                $scope.initQuagga();

            }else{

                console.log('adding...');
                //simmulate the "choose file" button
                var input = document.querySelector("input[type=file]");
                input.click();
            }


        };


        $scope.onResetTreat = function (){
            $scope.toolbarSelected = 'treatment';
            $scope.loteItem = undefined;
            $scope.lotePicked = false;
            $scope.errorMsg = "";
            $scope.treatmentText = "";
            $scope.view = 'step0';
        };

        $scope.onSaveTreat = function (){
            if($scope.treatmentText === ''){
                return false;
            }

            $scope.view = 'step1';

            var nowDate = new Date();
            var day = nowDate.getDate();
            var month = nowDate.getMonth();
            var year = nowDate.getFullYear();

            //store text in new treatment Row
            var newTreatmentLine = {
                descricao : $scope.treatmentText,
                datatratamento : nowDate.toISOString()
            };

            $scope.loteItem.u6526_lotes_tratamentos.push(newTreatmentLine);

            var cachedObject =  localStorage.getItem('credentials');
            if ( cachedObject ) {
                var credentials = JSON.parse(cachedObject);

                //#2 - Prepare params to get_refs_by_code WS
                var paramsServer = {
                    credentials: credentials,
                    lote: $scope.loteItem
                };


                //#3 - Make the Call!!
                $http.post('../server/save_lote_treatment.php', paramsServer)
                    .success(function(data) {

                        //result
                        console.log(data);
                        if(data.success){
                            $scope.view = 'step2';//view saved
                            $scope.toolbarSelected = 'treatment-success';
                        }else{
                            $scope.errorMsg = "Ocorreu um erro a gravar o lote, tente mais tarde.";
                            $scope.view = 'step0';//view treat again
                            $scope.toolbarSelected = 'treatment';
                        }




                    })
                    .error(function(data) {

                        console.log('Error: ' + data);
                    });


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
                    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
                },
            }, function (result) {
                if (result.codeResult) {
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