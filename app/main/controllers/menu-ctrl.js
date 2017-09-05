'use strict';
(function () {
  angular
    .module('main')
    .controller('MenuCtrl', MenuCtrl);

  function MenuCtrl (
    $state,
    $scope,
    $rootScope,
    $cordovaDevice,
    $log,
    API,
    MerchAPI,
    Mithril
  ) {

    var menuVm = this;
    var WooCommerce = API.WooCommerce();

    // GET USER DATA
    MerchAPI.getUserMeta()
    .then(function (resp) {
        resp = resp.data;
        Mithril.storage('userUrl', 'https://' + resp.site_url);
        Mithril.storage('userKey', resp.con_key);
        Mithril.storage('userSecret', resp.con_secret);
    });

    // DEFINE MENU FUNCTIONS
    menuVm.logout = logout;
    menuVm.getIndex = getIndex;
    menuVm.getAllProducts = getAllProducts;
    menuVm.getUnshippedOrders = getUnshippedOrders;
    menuVm.markOrderShipped = markOrderShipped;

    // TEST FUNCTIONS
    menuVm.getAllProducts();
    $log.log('allProducts', Mithril.chest('allProducts'));

    // DEFINE MENU VARIABLES
    menuVm.unshippedProducts = getArrayLength();
    menuVm.lowStockProducts = 3;
    menuVm.noStockProducts = 4;
    menuVm.subExpiryDays = 10;

    // GENERIC FUNCTIONS
    function logout() {
      $log.log('Logout requested');
      $state.go('login');
    }

    function getArrayLength(array) {
      if (angular.isObject(array)) {
        return array.length;
      }
      else {
        return 'N/A';
      }
    }

    // WOOCOMMERCE FUNCTIONS
    function getAllProducts() {
        WooCommerce.get('products', function (err, data, res) {
          Mithril.chest('allProducts', JSON.parse(res));
        });
    }

    function getIndex() {
        WooCommerce.get('', function (err, data, res) {
          Mithril.chest('siteIndex', JSON.parse(res));
        });
    }

    function getUnshippedOrders() {
        WooCommerce.get('orders?status=processing', function (err, data, res) {
          Mithril.chest('unshippedOrders', JSON.parse(res));
        });
    }

    function markOrderShipped(id) {
        var completion = {
            status: 'completed'
        };

        WooCommerce.put('orders/' + id, completion, function (err, data, res) {
          Mithril.storage('latestApiResponse', JSON.parse(res));
        });
    }
  }
})();
