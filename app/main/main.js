'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  // TODO: load other modules selected during generation
])
.config(function ($stateProvider, $urlRouterProvider) {

  // ROUTING with ui.router
  $urlRouterProvider.otherwise('/main/dashboard');
  $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
    .state('main', {
      url: '/main',
      abstract: true,
      templateUrl: 'main/templates/menu.html',
      controller: 'MenuCtrl as menu'
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
