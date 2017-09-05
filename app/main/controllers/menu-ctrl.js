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
    Mithril,
    Icarus
  ) {

    var menuVm = this;
    var WooCommerce = API.WooCommerce();

    // GET USER DATA
    Icarus.spinner();
    MerchAPI.getUserMeta()
    .then(function (resp) {
        resp = resp.data;
        Mithril.storage('userUrl', 'https://' + resp.site_url);
        Mithril.storage('userKey', resp.con_key);
        Mithril.storage('userSecret', resp.con_secret);
        Icarus.hide();
    });

    // DEFINE MENU FUNCTIONS
    menuVm.logout = logout;
    menuVm.doRefresh = doRefresh;
    menuVm.getIndex = getIndex;
    menuVm.getAllProducts = getAllProducts;
    menuVm.getUnshippedOrders = getUnshippedOrders;
    menuVm.markOrderShipped = markOrderShipped;

    // TEST FUNCTIONS
    menuVm.getAllProducts();

    // DEFINE MENU VARIABLES
    menuVm.unshippedProducts = getArrayLength();
    menuVm.lowStockProducts = getArrayLength();
    menuVm.noStockProducts = getArrayLength();
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

    function doRefresh() {
      menuVm.getAllProducts();
      $scope.$broadcast('scroll.refreshComplete');
    }

    // WOOCOMMERCE FUNCTIONS
    function getAllProducts() {
        WooCommerce.get('products', function (err, data, res) {
          Mithril.chest('allProducts', JSON.parse(res));
        });
    }

    function getProductVariants(id) {
      WooCommerce.get('products/' + id + '/variations', function(err, data, res) {
        Mithril.chest('variantProducts_' + id, JSON.parse(res));
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
