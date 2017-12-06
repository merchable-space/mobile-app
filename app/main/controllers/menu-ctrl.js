'use strict';
(function () {
  angular
    .module('main')
    .controller('MenuCtrl', MenuCtrl);

  function MenuCtrl (
    $state,
    $stateParams,
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
    menuVm.logout = logout;
    menuVm.doRefresh = doRefresh;
    menuVm.serviceStatusIcon = serviceStatusIcon;
    menuVm.saveUserSettings = saveUserSettings;
    menuVm.resetVariables = resetVariables;
    menuVm.updateUserMeta = updateUserMeta;
    menuVm.updateServiceStatus = updateServiceStatus;
    menuVm.togglePwdVisible = togglePwdVisible;

    // DEFINE PRODUCT FUNCTIONS
    menuVm.getAllProducts = getAllProducts;
    menuVm.getProductSingle = getProductSingle;
    menuVm.getProductVariants = getProductVariants;
    menuVm.returnAllVariantStock = returnAllVariantStock;
    menuVm.getStockWarnings = getStockWarnings;
    menuVm.getUnshippedOrders = getUnshippedOrders;
    menuVm.swapUnshippedSorting = swapUnshippedSorting;
    menuVm.markOrderShipped = markOrderShipped;
    menuVm.goToVariantStock = goToVariantStock;
    menuVm.goToSingleStock = goToSingleStock;
    menuVm.updateAllStock = updateAllStock;

    if (! Mithril.storage('userWPToken')) {
      // FORCE LOGOUT
      menuVm.logout();
      return false;
    }
    else {
      startUserData();
    }

    // GENERIC FUNCTIONS
    function startUserData() {
      menuVm.resetVariables();

      if (Mithril.chest('userSettings')) {
        menuVm.userSettings = Mithril.chest('userSettings');
      }
      else {
        menuVm.userSettings = {
          stockTrigger: 3,
          unshippedCount: 15
        };
      }

      MerchAPI.getSiteMeta()
      .then(function (resp) {
        resp = resp.data;

        Mithril.storage('dataCache', true);
        Mithril.storage('userLogo', resp.logo);
        Mithril.storage('userKey', resp.con_key);
        Mithril.storage('userSecret', resp.con_secret);
        Mithril.storage('userSubExpires', resp.expires);
        Mithril.storage('userSubType', resp.sub_type);

        menuVm.subExpiry = resp.expires;
        menuVm.subType = resp.sub_type;
      })
      .then(function() {
        menuVm.WooCommerce = API.WooCommerce();
      })
      .then(function() {
        // If WooCommerce hasn't loaded, try sequence again
        if (!angular.isObject(menuVm.WooCommerce)) {
          startUserData();
          return false;
        }

        menuVm.doRefresh();
      })
      .finally(function() {
        Icarus.hide();
      });
    }

    function doRefresh() {
      menuVm.resetVariables();
      menuVm.updateUserMeta();

      menuVm.getAllProducts();
      menuVm.returnAllVariantStock();
      menuVm.getStockWarnings();
      menuVm.updateServiceStatus();

      // Hides the spinner; keep last
      menuVm.getUnshippedOrders();
      $scope.$broadcast('scroll.refreshComplete');
    }

    function logout() {
      Mithril.destroy('userWPToken');
      Mithril.destroy('userWPHeader');
      $state.go('login');
    }

    function togglePwdVisible() {
      menuVm.showPassword = menuVm.showPassword ? false : true;
    }

    function serviceStatusIcon(number) {
      number = Math.round(number);
      switch (number) {
        case 0:
          return 'typcn typcn-tick green-text';
        case 1:
          return 'typcn typcn-warning amber-text';
        case 2:
          return 'typcn typcn-times red-text';
      }
    }

    function saveUserSettings() {
      Mithril.chest('userSettings', menuVm.userSettings);
      Icarus.saved('Settings saved!', 'typcn typcn-thumbs-up icon-fadeup', true, 2000);
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
      menuVm.trackingOrders = {};
      menuVm.sortUnshippedOrders = 'asc';
      menuVm.sortUnshippedClass = 'typcn typcn-arrow-sorted-up';
    }

    function updateUserMeta() {
      menuVm.logoImageBase = Mithril.storage('userLogo');
    }

    function updateServiceStatus() {
      MerchAPI.getServiceStatus()
      .then(function (resp) {
          resp = resp.data;

          menuVm.serviceStatus = resp;
          Mithril.chest('serviceStatus', resp);
      });

      $scope.$broadcast('scroll.refreshComplete');
    }

    // PRODUCTS

    function getAllProducts() {
      menuVm.WooCommerce.get('products', function (err, data, res) {
        var products = JSON.parse(res);
        Mithril.chest('allProducts', products);

        menuVm.productList = products;
        menuVm.productSingles = {};
        menuVm.productVariants = {};

        angular.forEach(products, function(product) {
          var prodId = product.id;

          if (product.type === 'simple') {
            menuVm.getProductSingle(prodId);
          }

          if (product.type === 'variable') {
            menuVm.getProductVariants(prodId);
          }
        });

        Mithril.chest('allVariants', menuVm.productVariants);
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    function getProductSingle(id) {
      menuVm.WooCommerce.get('products/' + id, function(err, data, res) {
        menuVm.productSingles[id] = JSON.parse(res);
      });
    }

    function getProductVariants(id) {
      menuVm.WooCommerce.get('products/' + id + '/variations', function(err, data, res) {
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
          if (variantSub !== null) {
            variantStock[variantSub.id] = variantSub.stock_quantity;
          }
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

    function swapUnshippedSorting() {
      if (menuVm.sortUnshippedOrders === 'asc') {
        menuVm.sortUnshippedOrders = 'desc';
        menuVm.sortUnshippedClass = 'typcn typcn-arrow-sorted-down';
      }
      else {
        menuVm.sortUnshippedOrders = 'asc';
        menuVm.sortUnshippedClass = 'typcn typcn-arrow-sorted-up';
      }

      Icarus.spinner();
      menuVm.getUnshippedOrders();
    }

    function getUnshippedOrders() {
      menuVm.WooCommerce.get('orders?status=processing&per_page=' + menuVm.userSettings.unshippedCount + '&orderby=id&order=' + menuVm.sortUnshippedOrders, function (err, data, res) {
        Mithril.chest('unshippedOrders', JSON.parse(res));
        menuVm.unshippedOrders = JSON.parse(res);
        Icarus.hide();
      });
      $scope.$broadcast('scroll.refreshComplete');
    }

    function markOrderShipped(id) {
      Icarus.spinner();
      var completion = {
          status: 'completed',
      };

      var trackingInfo = menuVm.trackingOrders[id] || null;

      if (trackingInfo) {
        var noteDetails;

        if (trackingInfo['reference'] && trackingInfo['company']) {
          noteDetails = 'Your order is on the way! It is being delivered by ' + trackingInfo['company'] + ' and has a tracking reference of ' + trackingInfo['reference'] + '.';
        }

        if (!trackingInfo['reference'] && trackingInfo['company']) {
          noteDetails = 'Your order is on the way! It is being delivered by ' + trackingInfo['company'] + '.';
        }

        if (trackingInfo['reference'] && !trackingInfo['company']) {
          Icarus.hide();
          Icarus.alert('Cannot Dispatch Order', 'Please include the shipping company if you are adding a tracking reference!');
          return false;
        }

        var trackNote = {
          note: noteDetails,
          customer_note: true
        };

        menuVm.WooCommerce.post('orders/' + id + '/notes', trackNote, function(err, data, res) {});
      }

      menuVm.WooCommerce.put('orders/' + id, completion, function (err, data, res) {
        if (res) {
          Icarus.hide();
          Icarus.saved('Order shipped!', 'typcn typcn-plane rotate-90 icon-flyleft', true, 2000);
          menuVm.getUnshippedOrders();
          menuVm.trackingOrders.id = null;
        }
      });
    }

    function goToSingleStock(product) {
      menuVm.currentProductStock = product;
      menuVm.stockToUpdate = {};
      menuVm.stockUpdating = 'single';

      var single = menuVm.productSingles[product];
      menuVm.stockToUpdate[single.id] = single.stock_quantity;
      menuVm.currentlyStocking = single;

      $state.go('main.stockUpdate');
    }

    function goToVariantStock(product) {
      menuVm.currentProductStock = product;
      menuVm.stockToUpdate = {};
      menuVm.stockUpdating = 'variant';

      angular.forEach(menuVm.productVariants[product], function(variant) {
        menuVm.stockToUpdate[variant.id] = variant.stock_quantity;
      });

      $state.go('main.stockUpdate');
    }

    function updateAllStock() {
      Icarus.spinner();
      angular.forEach(menuVm.stockToUpdate, function(stock, id) {

        if (Mithril.empty(stock) || (!angular.isNumber(stock))) {
          Icarus.alert('Error Updating Stock', 'Invalid value entered');
          return false;
        }

        var stockObj = {
          stock_quantity: stock
        };

        menuVm.WooCommerce.put('products/' + menuVm.currentProductStock + '/variations/' + id + '/', stockObj, function (err, data, res) {});
      });

      Icarus.hide();
      Icarus.saved('Stock updated!', 'typcn typcn-thumbs-up icon-fadeup', true, 2000);
      menuVm.getAllProducts();

      $state.go('main.stock');
    }
  }
})();
