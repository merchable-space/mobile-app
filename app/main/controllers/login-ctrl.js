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

      // Destroy WP tokens, in case they were kept from
      // previous states
      Mithril.destroy('userWPToken');
      Mithril.destroy('userWPHeader');
    });

    var loginVm = this;

    loginVm.user = {};
    loginVm.showPassword = false;

    loginVm.login = login;
    loginVm.togglePwdVisible = togglePwdVisible;

    function login() {
      // Always remember
      loginVm.user['remember_me'] = true;

      Icarus.spinner();
      MerchAPI.authWordpressUser(loginVm.user);
    }

    function togglePwdVisible() {
      loginVm.showPassword = loginVm.showPassword ? false : true;
    }
  }
})();
