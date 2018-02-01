'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  'ngStorage',
  'countUp'
])
.factory('httpRequestInterceptor', function ($injector) {
  return {
    request: function (config) {
      var Mithril = $injector.get('Mithril');
      var $http = $injector.get('$http');

      config.headers['WP-Authoriser'] = Mithril.storage('userWPHeader');
      $http.defaults.headers.common['WP-Authoriser'] = Mithril.storage('userWPHeader');

      return config;
    }
  };
})
.filter('capitalizeWord', function() {
  return function(text) {
    return (text) ? text.charAt(0).toUpperCase() + text.substr(1).toLowerCase() : '';
  };
})
.run(function($ionicPlatform, $injector) {
  $ionicPlatform.ready(function() {
      var Icarus = $injector.get('Icarus');
      Icarus.spinner();
  });
})
.config(function ($stateProvider, $urlRouterProvider, $localStorageProvider, $httpProvider) {

  // LOCAL STORAGE
  $localStorageProvider.setKeyPrefix('merchStore-');

  // VALIDATE EVERYTHING VIA JWT AUTH
  $httpProvider.interceptors.push('httpRequestInterceptor');

  // ROUTING
  $urlRouterProvider.otherwise('main/dashboard');
  $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
    .state('login', {
      url: '/login',
      cache: false,
      abstract: false,
      templateUrl: 'main/templates/login.html',
      controller: 'LoginCtrl as loginVm'
    })
    .state('main', {
      url: '/main',
      cache: false,
      abstract: true,
      templateUrl: 'main/templates/menu.html',
      controller: 'MenuCtrl as menuVm'
    })
      .state('main.dashboard', {
        url: '/dashboard',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/dashboard.html'
          }
        }
      })
      .state('main.stock', {
        url: '/stock',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/stock.html'
          }
        }
      })
      .state('main.stockUpdate', {
        url: '/stock-update',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/stock-update.html'
          }
        }
      })
      .state('main.warnings', {
        url: '/warnings',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/warnings.html'
          }
        }
      })
      .state('main.unavailable', {
        url: '/unavailable',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/unavailable.html'
          }
        }
      })
      .state('main.unshipped', {
        url: '/unshipped',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/unshipped.html'
          }
        }
      })
      .state('main.settings', {
        url: '/settings',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/settings.html'
          }
        }
      })
      .state('main.subscription', {
        url: '/subscription',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/subscription.html'
          }
        }
      })
      .state('main.stats', {
        url: '/statistics',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/stats.html'
          }
        }
      })
      .state('main.past', {
        url: '/past',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/past.html'
          }
        }
      })
      .state('main.service', {
        url: '/service',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/service.html'
          }
        }
      });
});
