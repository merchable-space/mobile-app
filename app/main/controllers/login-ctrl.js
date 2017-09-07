'use strict';
(function () {
  angular
    .module('main')
    .controller('LoginCtrl', LoginCtrl);

  function LoginCtrl (
    $state,
    $scope,
    $rootScope,
    $cordovaDevice,
    $log,
    MerchAPI,
    Mithril,
    Icarus
  ) {

    $scope.$on('$ionicView.enter', function() {
      // Login page has loaded; hide the app-boot spinner
      Icarus.hide();
    });


    var loginVm = this;

    loginVm.user = {};

    loginVm.login = login;

    function login() {
      // Always remember
      loginVm.user['remember_me'] = true;

      Icarus.spinner();
      MerchAPI.authWordpressUser(loginVm.user);
    }
  }
})();
