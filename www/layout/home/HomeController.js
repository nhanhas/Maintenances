app
    .controller('HomeController', ['$scope', '$location','$rootScope', function($scope, $location,$rootScope) {

        //var for navbar selection
        $scope.viewSelected = 'home';

        $scope.startTicket = function(){
            $location.path('/ticket');
        };

        $scope.viewPending = function(){
            $location.path('/pending');
        };

        $scope.addTreatment = function(){
            $location.path('/treatment');
        };

        $scope.setupDrive = function(){
            $location.path('/settings');
        };

    }]);


