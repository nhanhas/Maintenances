app

    .directive('toolbar', ['$location', function(location) {
        return {
            restrict: 'EA',
            scope: {
                viewSelected:'@',
                onStart:'&?',
                onAdd:'&?',
                onAddManual:'&?',
                onReset:'&?',
                onFinish:'&?',
                onResetSettings:'&?',
                onTestConnection:'&?',
                onConnectSettings:'&?',
                onFinalizeSettings:'&?',
                onRefreshList:'&?',
                onAddManualTreat:'&?',
                onAddTreat:'&?',
                onResetTreat:'&?',
                onSaveTreat:'&?'
            },
            templateUrl: 'shared/toolbar/toolbar.html',

            link: function (scope, element, attrs) {

                scope.addProdClicked = false;//for order view

                scope.goBack = function (){
                    location.path('/home');
                };

                scope.goConfig = function (){
                    location.path('/settings');
                };

                /**
                 * Orders
                 */
                scope.onStartOrder = function(){
                    if(scope.onStart){
                        scope.onStart();
                    }
                };

                scope.toggleAddNew = function(){

                    scope.addProdClicked = !scope.addProdClicked;


                };

                scope.addNewProductBar = function(){
                    scope.addProdClicked = false;
                    if(scope.onAdd){
                        scope.onAdd();
                    }
                };

                scope.addNewProductManual = function(){
                    scope.addProdClicked = false;
                    var refLote = prompt("Referência do lote", "");
                    if (refLote !== null) {
                        if(scope.onAddManual){
                            scope.onAddManual({ref: refLote});
                        }
                    }

                };

                scope.onResetAll = function(){
                    if(scope.onReset){
                        scope.onReset();
                    }
                };

                scope.onFinishInvoince = function(){
                    if(scope.onFinish){
                        scope.onFinish();
                    }
                };


                /**
                 * Settings
                 */

                scope.resetSettings = function(){
                    if(scope.onResetSettings){
                        scope.onResetSettings();
                    }
                };

                scope.testConnection = function(){
                    if(scope.onTestConnection){
                        scope.onTestConnection();
                    }
                };

                scope.connectSettings = function(){
                    if(scope.onConnectSettings){
                        scope.onConnectSettings();
                    }
                };

                scope.finalizeSettings = function(){
                    if(scope.onFinalizeSettings){
                        scope.onFinalizeSettings();
                    }
                }

                /**
                 * Pending
                 */

                scope.refreshList = function(){
                    if(scope.onRefreshList()){
                        scope.onRefreshList();
                    }
                };

                /**
                 * Treatment
                 */
                scope.addNewRefTreat = function(){
                    scope.addProdClicked = false;
                    if(scope.onAddTreat){
                        scope.onAddTreat();
                    }
                };

                scope.addNewTreatManual = function(){
                    scope.addProdClicked = false;
                    var refLote = prompt("Referência do lote", "");
                    if (refLote !== null) {
                        if(scope.onAddManualTreat){
                            scope.onAddManualTreat({ref: refLote});
                        }
                    }

                };
                scope.saveTreat = function(){
                    if(scope.onSaveTreat){
                        scope.onSaveTreat();
                    }
                };

                scope.resetTreat = function(){
                    if(scope.onResetTreat){
                        scope.onResetTreat();
                    }
                };


            }
        };
    }]);