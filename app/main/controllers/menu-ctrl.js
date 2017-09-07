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

    // DEFINE MENU FUNCTIONS
    menuVm.startUserData = startUserData;
    menuVm.logout = logout;
    menuVm.amIUndefined = amIUndefined;
    menuVm.doRefresh = doRefresh;
    menuVm.subDangerLevel = subDangerLevel;
    menuVm.subDangerIcon = subDangerIcon;
    menuVm.subDangerText = subDangerText;
    menuVm.saveUserSettings = saveUserSettings;
    menuVm.resetVariables = resetVariables;
    menuVm.updateUserMeta = updateUserMeta;

    // DEFINE PRODUCT FUNCTIONS
    menuVm.getAllProducts = getAllProducts;
    menuVm.getProductVariants = getProductVariants;
    menuVm.returnAllVariantStock = returnAllVariantStock;
    menuVm.getStockWarnings = getStockWarnings;
    menuVm.getUnshippedOrders = getUnshippedOrders;
    menuVm.markOrderShipped = markOrderShipped;

    if (menuVm.amIUndefined(Mithril.chest('userWPToken'))) {
      menuVm.logout();
      return false;
    }

    menuVm.startUserData();
    menuVm.resetVariables();
    var WooCommerce = API.WooCommerce();

    // SETTINGS VARIABLES
    menuVm.userSettings = {
      stockTrigger: 3
    };

    if (Mithril.chest('userSettings')) {
      menuVm.userSettings = Mithril.chest('userSettings');
    }

    // VARIABLES ARE SET - START LOADING
    menuVm.doRefresh();

    // GENERIC FUNCTIONS

    function amIUndefined(item) {
      if (item === null) {
        return true;
      }

      if (item === undefined) {
        return true;
      }
    }

    function doRefresh() {
      menuVm.resetVariables();
      menuVm.updateUserMeta();

      menuVm.getAllProducts();
      menuVm.returnAllVariantStock();
      menuVm.getStockWarnings();
      menuVm.getUnshippedOrders();

      $scope.$broadcast('scroll.refreshComplete');
      Icarus.hide();
    }

    function startUserData() {
      Icarus.spinner();
      MerchAPI.getUserMeta()
      .then(function (resp) {
          resp = resp.data;

          Mithril.storage('userUrl', 'https://' + resp.site_url);
          Mithril.storage('userKey', resp.con_key);
          Mithril.storage('userSecret', resp.con_secret);
          Mithril.storage('userLogo', resp.logo);

          Mithril.storage('dataCache', false);
      });
    }

    function logout() {
      Mithril.wipeout();
      $state.go('login');
    }

    function subDangerIcon() {
      if (menuVm.subExpiryDays <= 0) {
        return 'ion-close-circled';
      }

      if (menuVm.subExpiryDays <= 10) {
        return 'ion-alert-circled';
      }

      if (menuVm.subExpiryDays > 10) {
        return 'ion-checkmark-circled';
      }
    }

    function subDangerLevel() {
      if (menuVm.subExpiryDays <= 0) {
        return 'red-text';
      }

      if (menuVm.subExpiryDays <= 10) {
        return 'amber-text';
      }

      if (menuVm.subExpiryDays > 10) {
        return false;
      }
    }

    function subDangerText() {
      if (menuVm.subExpiryDays <= 0) {
        var dayTerm = Math.abs(menuVm.subExpiryDays) === 1 ? ' day' : ' days';

        return 'Expired ' + Math.abs(menuVm.subExpiryDays) + dayTerm + ' ago';
      }
      else {
        return 'Expires in ' + menuVm.subExpiryDays + dayTerm;
      }
    }

    function saveUserSettings() {
      Mithril.chest('userSettings', menuVm.userSettings);
      Icarus.show('Settings saved', true, 2000);
    }

    function getArrayLength(array) {
      if (angular.isObject(array)) {
        return array.length + '';
      }
      else {
        return 'N/A';
      }
    }

    // FUNCTIONS

    function resetVariables() {
      menuVm.unshippedProducts = getArrayLength(Mithril.chest('unshippedOrders'));
      menuVm.lowStockProducts = 0;
      menuVm.noStockProducts = 0;
      menuVm.subExpiryDays = 0;
      menuVm.subDangerStatus = 'OK!';
    }

    function updateUserMeta() {
      menuVm.logoImageBase = Mithril.storage('userLogo');
    }

    // PRODUCTS

    function getAllProducts() {
      WooCommerce.get('products', function (err, data, res) {
        var products = JSON.parse(res);
        Mithril.chest('allProducts', products);

        menuVm.productList = products;
        menuVm.productVariants = {};

        angular.forEach(products, function(product) {
          var prodId = product.id;
          if (product.type === 'variable') {
            menuVm.getProductVariants(prodId);
          }
        });

        Mithril.chest('allVariants', menuVm.productVariants);
      });
    }

    function getProductVariants(id) {
      WooCommerce.get('products/' + id + '/variations', function(err, data, res) {
        menuVm.productVariants[id] = JSON.parse(res);
      });
    }

    function returnProductVariants(id) {
      if (!Mithril.chest('allVariants')) {
        menuVm.getAllProducts();
      }

      var variantList = Mithril.chest('allVariants');
      return variantList[id];
    }

    // STOCK

    function returnAllVariantStock() {
      if (!Mithril.chest('allVariants')) {
        menuVm.getAllProducts();
      }

      var variantList = Mithril.chest('allVariants');
      var variantStock = {};

      angular.forEach(variantList, function(variant) {
        angular.forEach(variant, function(variantSub) {
          variantStock[variantSub.id] = variantSub.stock_quantity;
        });
      });

      Mithril.chest('variantStock', variantStock);
    }

    function returnVariantStock(id) {
      if (!Mithril.chest('variantStock')) {
        menuVm.returnAllVariantStock();
      }

      var variants = Mithril.chest('variantStock');
      return variants[id];
    }

    function getStockWarnings() {
      if (!Mithril.chest('variantStock')) {
        menuVm.returnAllVariantStock();
      }

      var variantStock = Mithril.chest('variantStock');

      angular.forEach(variantStock, function(stock) {
        if (stock === 0) {
          menuVm.noStockProducts++;
        }

        if ((stock <= menuVm.userSettings['stockTrigger']) && (stock > 0)) {
          menuVm.lowStockProducts++;
        }
      });
    }

    // ORDERS

    function getUnshippedOrders() {
      WooCommerce.get('orders?status=processing', function (err, data, res) {
        Mithril.chest('unshippedOrders', JSON.parse(res));
        menuVm.unshippedOrders = JSON.parse(res);
      });
      $scope.$broadcast('scroll.refreshComplete');
    }

    function markOrderShipped(id) {
      Icarus.spinner();
      var completion = {
          status: 'completed'
      };

      WooCommerce.put('orders/' + id, completion, function (err, data, res) {
        if (res) {
          Icarus.hide();
          Icarus.show('Order shipped!', true, 2000);
          menuVm.getUnshippedOrders();
        }
      });
    }
  }
})();
