'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  'ngStorage'
])
.factory('httpRequestInterceptor', function ($injector) {
  return {
    request: function (config) {
      var Mithril = $injector.get('Mithril');
      var $http = $injector.get('$http');

      if ( Mithril.storage('userWPToken') ) {
        config.headers['Authorization'] = Mithril.storage('userWPHeader');
        $http.defaults.headers.common['Authorization'] = Mithril.storage('userWPHeader');
      }

      return config;
    }
  };
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
      abstract: false,
      templateUrl: 'main/templates/login.html',
      controller: 'LoginCtrl as loginVm'
    })
    .state('main', {
      url: '/main',
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
      .state('main.twitter', {
        url: '/twitter',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/twitter.html'
          }
        }
      });
});
