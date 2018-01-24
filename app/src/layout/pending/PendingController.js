app
    .controller('PendingController', ['$scope', '$location','$rootScope','$http', function($scope, $location,$rootScope,$http) {

        $scope.invoiceList = [];
        $scope.toolbarSelected = 'pending-config';
        $scope.loadingDocuments = false;

        $scope.synching = false;

        $scope.getInvoiceDate = function(date){
            return date.split(" ")[0];
        };

        //get Document Types
        $scope.getDocuments = function(){
            $scope.loadingDocuments = true;

            //check if it is in cache
            var cachedObject =  localStorage.getItem('credentials');
            if ( cachedObject ){
                $scope.credentials = JSON.parse(cachedObject);
            }

            $scope.synching = true;

            $http.post('../server/get_invoices.php', $scope.credentials)
                .success(function(data) {
                    $scope.synching = false;

                    $scope.loadingDocuments = false;
                    if(data !== " "){
                        if(data.result.length > 0 ){
                            $scope.invoiceList = data.result;
                        }
                    }
                })
                .error(function(data) {
                    $scope.synching = false;
                    $scope.loadingDocuments = false;
                    console.log('Error: ' + data);
                });


        };

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
            $scope.toolbarSelected = 'pending';

            $scope.getDocuments();

        }else{
            $scope.toolbarSelected = 'pending-config';
            $scope.mustConfig = true;
        }

        $scope.editInvoice = function(invoice){

            console.log(invoice);

            $rootScope.invoicePending = invoice;

            $location.path('/order');
        };

    }]);


