app

    .directive('header', function() {
        return {
            restrict: 'EA',
            scope: {
            },
            templateUrl: 'shared/header/header.html',

            link: function (scope, element, attrs) {
                //Nothing to implement
            }
        };
    });