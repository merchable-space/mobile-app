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
    $http,
    API,
    MerchAPI,
    Mithril,
    Icarus
  ) {

    var menuVm = this;

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

    var WooCommerce = API.WooCommerce();

    // DEFINE MENU FUNCTIONS
    menuVm.logout = logout;
    menuVm.doRefresh = doRefresh;
    menuVm.subDangerLevel = subDangerLevel;
    menuVm.subDangerIcon = subDangerIcon;
    menuVm.subDangerText = subDangerText;
    menuVm.saveUserSettings = saveUserSettings;
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

    // SETTINGS VARIABLES
    menuVm.userSettings = {
      stockTrigger: 3
    };

    if (Mithril.chest('userSettings')) {
      menuVm.userSettings = Mithril.chest('userSettings');
    }

    // GENERIC FUNCTIONS
    function logout() {
      Mithril.destroy('userWPToken');
      $http.defaults.headers.common.Authorization = '';
      $state.go('login');
    }

    function subDangerIcon() {
      if (menuVm.subExpiryDays > 10) {
        return 'ion-checkmark-circled';
      }

      if (menuVm.subExpiryDays <= 10) {
        return 'ion-alert-circled';
      }

      if (menuVm.subExpiryDays <= 0) {
        return 'ion-close-circled';
      }
    }

    function subDangerLevel() {
      if (menuVm.subExpiryDays > 10) {
        return false;
      }

      if (menuVm.subExpiryDays <= 10) {
        return 'amber-text';
      }

      if (menuVm.subExpiryDays <= 0) {
        return 'red-text';
      }
    }

    function subDangerText() {
      if (menuVm.subExpiryDays > 0) {
        return 'Your subscription expires in ' + menuVm.subExpiryDays + ' days';
      }

      if (menuVm.subExpiryDays <= 0) {
        return 'Your subscription expired' + menuVm.subExpiryDays.substr(1, 2) + 'days ago';
      }
    }

    function saveUserSettings() {
      Mithril.chest('userSettings', menuVm.userSettings);
      Icarus.show('Settings saved', true, 2000);
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
