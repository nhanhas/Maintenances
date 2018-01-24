app
    .controller('TicketController', ['$scope', '$location','$rootScope', '$timeout','$http', function($scope, $location,$rootScope, $timeout, $http) {

        //Views flags
        $scope.step1 = true;//add prod view
        $scope.step2 = false;//loading view
        $scope.step3 = false;//finished view
        $scope.toolbarSelected = 'order-start';

        //Products Collection
        $scope.productsList = [];

        //Client Collection
        $scope.assetList = [];
        $scope.assetSelected = undefined;
        $scope.loadingAssets = false;

        $scope.synching = false;

        //check if it is in cache - configured
        var cachedObject =  localStorage.getItem('credentials');
        if ( cachedObject){
            $scope.step0 = false; //config needed
            $scope.stepChoose = true;//choose asset
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

        //load clients from Drive FX
        $scope.fetchAssets = function () {

            var cachedObject =  localStorage.getItem('credentials');
            if ( cachedObject ){
                var credentials = JSON.parse(cachedObject);

                //#2 - Prepare params to creation_invoice WS
                var paramsServer = {
                    credentials: credentials
                };

                $scope.synching = true;

                //#3 - Make the Call!!
                $http.post('../server/fetch_assets.php', paramsServer)
                    .success(function(data) {
                        $scope.loadingAssets = false;
                        $scope.synching = false;

                        //result
                        console.log(data);
                        if(data.result.length > 0){
                            $scope.assetList = data.result;
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
                        $scope.loadingAssets = false;
                        console.log('Error: ' + data);
                    });

            }



        };


        //In case that stepChoose is active an there's no clients then load
        if($scope.stepChoose || $scope.assetList.length === 0 ){
            $scope.loadingAssets = true;

            $scope.fetchAssets();
        }else{
            $scope.loadingAssets = false;
        }


        //for toolbar stepChoose
        $scope.onStartingTicket = function(){
            $scope.assetSelected = $('#assetInput').val();
            //TODO validate if client is choosed
            $scope.step0 = false; //config needed
            $scope.stepChoose = false;//choose client
            $scope.step1 = true;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order';

        }

        $scope.onResetAll = function (){
            console.log('resetting...');
            //$scope.assetList = [];
            $scope.errorMsg = "";

            $scope.assetSelected = undefined;
            $('#assetInput').val("");
            $('#assetInput').empty();
            $('#assetLabel').text("");


            $scope.toolbarSelected = 'order';
            $scope.step0 = false; //config needed
            $scope.stepChoose = true;//choose client
            $scope.step1 = false;//add prod view
            $scope.step2 = false;//loading view
            $scope.step3 = false;//finished view
            $scope.toolbarSelected = 'order-start';
        };

    }]);
