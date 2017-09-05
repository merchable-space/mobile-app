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
    Icarus
  ) {

    var loginVm = this;

    loginVm.user = {};

    loginVm.login = login;
    loginVm.auth = auth;

    function login() {
      MerchAPI.authWordpressUser(loginVm.user);
    }

    function auth() {
      Icarus.spinner();
    }
  }
})();
