app
    .controller('LoginController', ['$scope', '$location','$rootScope', function($scope, $location,$rootScope) {

        $scope.username = "";
        $scope.password = "";


        $scope.doLogin = function(){
            //navigate
            $location.path('/home');
        }

    }]);