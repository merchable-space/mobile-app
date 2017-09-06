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

    var loginVm = this;

    loginVm.user = {};

    loginVm.login = login;

    function login() {
      Icarus.spinner();
      MerchAPI.authWordpressUser(loginVm.user);
    }
  }
})();
