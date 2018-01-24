var app = angular.module("App", ['ngRoute']);

app
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/home', {
                    templateUrl: 'layout/home/home.html',
                    controller: 'HomeController'
                }).
                when('/order', {
                    templateUrl: 'layout/order/order.html',
                    controller: 'OrderController'
                }).
                when('/pending', {
                    templateUrl: 'layout/pending/pending.html',
                    controller: 'PendingController'
                }).
                when('/treatment', {
                    templateUrl: 'layout/treatment/treatment.html',
                    controller: 'TreatmentController'
                }).
                when('/settings', {
                    templateUrl: 'layout/settings/settings.html',
                    controller: 'SettingsController'
                }).
                otherwise({
                    redirectTo: '/home'
                });
        }
    ]);



