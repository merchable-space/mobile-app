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

    $scope.$on('$ionicView.beforeEnter', function() {
      if (! Mithril.storage('userWPToken')) {
        $state.go('login');
      }
    });

    // GET USER DATA
    Icarus.spinner();
    MerchAPI.getUserMeta()
    .then(function (resp) {
        resp = resp.data;
        Mithril.storage('userUrl', 'https://' + resp.site_url);
        Mithril.storage('userKey', resp.con_key);
        Mithril.storage('userSecret', resp.con_secret);
        Mithril.storage('userLogo', resp.logo_img);
        Icarus.hide();
    });

    var WooCommerce = API.WooCommerce();

    // DEFINE MENU FUNCTIONS
    menuVm.getEverything = getEverything;
    menuVm.logout = logout;
    menuVm.resetVariables = resetVariables;
    menuVm.doRefresh = doRefresh;
    menuVm.subDangerLevel = subDangerLevel;
    menuVm.subDangerIcon = subDangerIcon;
    menuVm.subDangerText = subDangerText;
    menuVm.saveUserSettings = saveUserSettings;
    menuVm.getIndex = getIndex;
    menuVm.getAllProducts = getAllProducts;
    menuVm.getProductVariants = getProductVariants;
    menuVm.getAllProductVariants = getAllProductVariants;
    menuVm.getAllVariantStock = getAllVariantStock;
    menuVm.getVariantStock = getVariantStock;
    menuVm.getStockWarnings = getStockWarnings;
    menuVm.getUnshippedOrders = getUnshippedOrders;
    menuVm.markOrderShipped = markOrderShipped;

    // DEFINE MENU VARIABLES
    menuVm.logoImageBase = Mithril.storage('userLogo');
    menuVm.unshippedProducts = getArrayLength(Mithril.chest('unshippedOrders'));
    menuVm.lowStockProducts = 0;
    menuVm.noStockProducts = 0;
    menuVm.subExpiryDays = 10;

    // SETTINGS VARIABLES
    menuVm.userSettings = {
      stockTrigger: 3
    };

    if (Mithril.chest('userSettings')) {
      menuVm.userSettings = Mithril.chest('userSettings');
    }

    // VARIABLES ARE SET - START LOADING
    menuVm.getEverything();
    console.log(Mithril.pandora());
    Icarus.hide();

    // GENERIC FUNCTIONS
    function logout() {
      Mithril.destroy('userWPToken');
      Mithril.destroy('userWPHeader');
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
        return array.length + '';
      }
      else {
        return 'N/A';
      }
    }

    function doRefresh() {
      menuVm.getEverything();
      $scope.$broadcast('scroll.refreshComplete');
    }

    // WOOCOMMERCE FUNCTIONS
    function getEverything() {
      menuVm.resetVariables();
      menuVm.getAllProducts();
      menuVm.getAllProductVariants();
      menuVm.getAllVariantStock();
      menuVm.getStockWarnings();
      menuVm.getUnshippedOrders();
    }

    function resetVariables() {
      menuVm.unshippedProducts = getArrayLength(Mithril.chest('unshippedOrders'));
      menuVm.lowStockProducts = 0;
      menuVm.noStockProducts = 0;
    }

    function getAllProducts() {
        WooCommerce.get('products', function (err, data, res) {
          Mithril.chest('allProducts', JSON.parse(res));
        });
    }

    function getVariantsForProduct(productId) {
      var allProductVars = Mithril.chest('variantProducts');
      return allProductVars[productId];
    }

    function getAllProductVariants() {
      var allProducts = Mithril.chest('allProducts');

      angular.forEach(allProducts, function(product) {
        if (product.type === 'variable') {
          menuVm.getProductVariants(product.id);
        }
      });
    }

    function getProductVariants(id) {
      WooCommerce.get('products/' + id + '/variations', function(err, data, res) {
        var variants = Mithril.chest('variantProducts') || {};
        variants[id] = JSON.parse(res);

        Mithril.chest('variantProducts', variants);
      });
    }

    function getAllVariantStock() {
      var allVariants = Mithril.chest('variantProducts');
      var variantStock = {};

      angular.forEach(allVariants, function(variant) {
        angular.forEach(variant, function(variantSub) {
          variantStock[variantSub.id] = variantSub.stock_quantity;
        });
      });

      Mithril.chest('variantStock', variantStock);
    }

    function getVariantStock(variantId) {
      var variantStock = Mithril.chest('variantStock');
      return variantStock[variantId];
    }

    function getStockWarnings() {
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
