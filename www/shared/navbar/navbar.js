app

    .directive('navbar', ['$location', function(location) {
        return {
            restrict: 'EA',
            scope: {
                viewSelected:'='
            },
            templateUrl: 'shared/navbar/navbar.html',

            link: function (scope, element, attrs) {

                scope.viewSelected = scope.viewSelected || 'home';

                //return to Home
                scope.selectView = function (view){

                    scope.viewSelected = view;

                };

            }
        };
    }]);