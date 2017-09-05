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
    Icarus
  ) {

    var loginVm = this;

    loginVm.user = {};

    loginVm.login = login;
    loginVm.auth = auth;

    function login() {
      $state.go('main.dashboard');
    }

    function auth() {
      Icarus.spinner();
    }
  }
})();
