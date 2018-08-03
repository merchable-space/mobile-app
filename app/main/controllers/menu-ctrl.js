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
    Icarus,
    $ionicPlatform,
    $ionicModal,
    $filter,
    $q
  ) {

    $ionicPlatform.ready(function() {
      if (angular.isDefined(cordova)) {
        cordova.getAppVersion.getVersionNumber().then(function (version) {
          $scope.currentAppVersion = version;
        });
      }

      window.FirebasePlugin.onTokenRefresh(function(token) {
        Mithril.storage('userPushId', token);
      }, function(error) {
        $log.log(error);
      });
    });

    var menuVm = this;

    // DEFINE MENU FUNCTIONS
    menuVm.logout = logout;
    menuVm.doRefresh = doRefresh;
    menuVm.serviceStatusIcon = serviceStatusIcon;
    menuVm.saveUserSettings = saveUserSettings;
    menuVm.resetVariables = resetVariables;
    menuVm.updateUserMeta = updateUserMeta;
    menuVm.checkUpdateLink = checkUpdateLink;
    menuVm.getAppUpdater = getAppUpdater;
    menuVm.updateServiceStatus = updateServiceStatus;
    menuVm.togglePwdVisible = togglePwdVisible;
    menuVm.stockViewToggle = stockViewToggle;
    menuVm.stockViewShow = stockViewShow;
    menuVm.openShippingModal = openShippingModal;
    menuVm.closeShippingModal = closeShippingModal;
    menuVm.registerPushDevice = registerPushDevice;
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
    menuVm.goToBundleStock = goToBundleStock;
    menuVm.updateAllStock = updateAllStock;
    menuVm.serviceStatusLink = serviceStatusLink;
    menuVm.getPastOrders = getPastOrders;
    menuVm.getStoreStats = getStoreStats;
    menuVm.toggleReportPeriod = toggleReportPeriod;
    menuVm.toggleMultiStockEdit = toggleMultiStockEdit;
    menuVm.bulkUpdateMultiStock = bulkUpdateMultiStock;
    menuVm.releaseNotes = releaseNotes;
    menuVm.acknowledgeRelease = acknowledgeRelease;
    menuVm.openBulkNotes = openBulkNotes;
    menuVm.closeBulkNotes = closeBulkNotes;

    $ionicModal.fromTemplateUrl('main/templates/shipping-modal.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose: false
    }).then(function(modal) {
      menuVm.shippingModal = modal;
    });

    $ionicModal.fromTemplateUrl('main/templates/note-modal.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose: false
    }).then(function(modalThree) {
      menuVm.bulkNotesModal = modalThree;
    });

    $ionicModal.fromTemplateUrl('main/templates/release-notes.html', {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose: false
    }).then(function(modalTwo) {
      menuVm.releaseModal = modalTwo;
    });

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
          unshippedCount: 15,
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
      menuVm.checkUpdateLink();
      menuVm.getStoreStats();
      menuVm.getPastOrders();

      // Hides the spinner; keep last
      menuVm.getUnshippedOrders(true);
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

    function releaseNotes() {
      menuVm.releaseModal.show();
    }

    function acknowledgeRelease() {
      menuVm.releaseModal.hide();
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
      menuVm.stockViewList = {};
      menuVm.trackingOrders = {};
      menuVm.sortUnshippedOrders = 'asc';
      menuVm.sortUnshippedClass = 'typcn typcn-arrow-sorted-up';
      menuVm.reportPeriod = 'week';
      menuVm.updateUrl = false;
      menuVm.showReportToggle = false;
      menuVm.bulkUpdateStock = null;
      menuVm.bulkUpdatePrice = null;
      menuVm.bulkUpdateOnSale = false;
      menuVm.bulkUpdateSalePrice = null;
      menuVm.storeStats = {
        'total': 0.00,
        'orders': 0,
        'products': 0,
        'popular': {'name': 'N/A', 'quantity': '-'}
      };
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

    function serviceStatusLink(url) {
      openBrowser(url, '_blank');
    }

    function getAppUpdater() {
      var url = 'https://api.merchable.space/updater.php?version=' + $scope.currentAppVersion;
      openBrowser(url, '_system');
    }

    function registerPushDevice() {
      MerchAPI.registerDevice()
      .then(function (resp) {
          resp = resp.data;

          Icarus.saved(resp, 'typcn typcn-device-phone icon-fadeup', true, 2000);
      });
    }

    function checkUpdateLink() {
      menuVm.updateNeeded = false;

      MerchAPI.getAppUpdate($scope.currentAppVersion)
      .then(function (resp) {
          resp = resp.data;

          if (resp.new_file === true) {
            menuVm.updateNeeded = true;
          }
      });
    }

    function stockViewShow(id) {
      if (menuVm.stockViewList[id]) {
        return false;
      }
      menuVm.stockViewList[id] = false;
    }

    function stockViewToggle(id) {
      if (menuVm.stockViewList[id] === true) {
        menuVm.stockViewList[id] = false;
      }
      else {
        menuVm.stockViewList[id] = true;
      }
    }

    function openBrowser(url, target) {
      if (angular.isDefined(cordova)) {
        cordova.InAppBrowser.open(url, target, 'location=no');
      }
    }

    // PRODUCTS

    function getAllProducts() {
      menuVm.WooCommerce.get('products', function (err, data, res) {
        var products = JSON.parse(res);
        Mithril.chest('allProducts', products);

        menuVm.productList = products;
        menuVm.productSingles = {};
        menuVm.productVariants = {};
        menuVm.productStockWarnings = {};
        menuVm.productPreorders = {};

        angular.forEach(products, function(product) {
          var prodId = product.id;

          if (product.type === 'simple' || product.type === 'woosb') {
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

        if (menuVm.productSingles[id].stock_quantity <= menuVm.userSettings['stockTrigger']) {
        menuVm.productStockWarnings[id] = 1;
        }

        if (menuVm.productSingles[id].stock_quantity === 0) {
          menuVm.productStockWarnings[id] = 0;
        }

        if (menuVm.productSingles[id].stock_quantity === null) {
          menuVm.productStockWarnings[id] = null;
        }

        menuVm.productPreorders[id] = false;

        angular.forEach(menuVm.productSingles[id].meta_data, function(metadata) {
          if (metadata.key === '_ywpo_preorder' && metadata.value === 'yes') {
            menuVm.productPreorders[id] = true;
            menuVm.productStockWarnings[id] = null;
          }
        })
      });
    }

    function getProductVariants(id) {
      menuVm.WooCommerce.get('products/' + id + '/variations', function(err, data, res) {
        menuVm.productVariants[id] = JSON.parse(res);

        menuVm.productStockWarnings[id] = null;
        var keepGoing = true;

        angular.forEach(menuVm.productVariants[id], function(variant) {
          if (keepGoing) {
            if (variant.stock_quantity <= menuVm.userSettings['stockTrigger']) {
              menuVm.productStockWarnings[id] = 1;

              if (variant.stock_quantity === 0) {
                menuVm.productStockWarnings[id] = 0;
              }

              if (variant.stock_quantity === null) {
                menuVm.productStockWarnings[id] = null;
              }

              keepGoing = false;
            }
          }
        });
      });
    }

    function returnProductVariants(id) {
      if (!Mithril.chest('allVariants')) {
        menuVm.getAllProducts();
      }

      var variantList = Mithril.chest('allVariants');
      return variantList[id];
    }

    function getPastOrders() {
      menuVm.WooCommerce.get('orders?status=completed&per_page=15&orderby=id&order=desc', function(err, data, res) {
        Mithril.chest('pastOrders', JSON.parse(res));
        menuVm.pastOrders = JSON.parse(res);
      });

      $scope.$broadcast('scroll.refreshComplete');
    }

    function getStoreStats(period) {
      if (angular.isDefined(period)) {
        menuVm.reportPeriod = period;
        Icarus.spinner();
      }

      menuVm.showReportToggle = false;

      var d = moment();
      var now = d.format('YYYY-MM-DD');
      var then;

      switch (menuVm.reportPeriod) {
        case 'week':
          then = d.subtract(7, 'days').format('YYYY-MM-DD');
          break;
        case 'month':
          then = d.subtract(1, 'month').format('YYYY-MM-DD');
          break;
        case 'year':
          then = d.subtract(1, 'year').format('YYYY-MM-DD');
          break;
      }

      menuVm.storeStatsFrom = then;
      menuVm.storeStatsTo = now;

      menuVm.WooCommerce.get('system_status', function(err, data, res) {
        var sysStat = JSON.parse(res);
        menuVm.currencySymbol = sysStat.settings['currency_symbol'];
      });

      menuVm.WooCommerce.get('reports/sales?date_min=' + then + '&date_max=' + now, function(err, data, res) {
        var salesReport = JSON.parse(res);
        salesReport = salesReport[0];

        menuVm.storeStats.total = parseFloat(salesReport.total_sales);

        if (isNaN(menuVm.storeStats.total)) {
          menuVm.storeStats.total = 0.00;
        }

        menuVm.storeStats.orders = salesReport.total_orders;
        menuVm.storeStats.products = salesReport.total_items;
      });

      menuVm.WooCommerce.get('reports/top_sellers?date_min=' + then + '&date_max=' + now, function(err, data, res) {
        var productReport = JSON.parse(res);

        if (productReport.length > 0) {
          menuVm.storeStats.popular = productReport[0];
        } else {
          menuVm.storeStats.popular = {'name': 'N/A', 'quantity': '-'};
        }

        Icarus.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    function toggleReportPeriod() {
      if (menuVm.showReportToggle === false) {
        menuVm.showReportToggle = true;
      } else {
        menuVm.showReportToggle = false;
      }
    }

    function toggleMultiStockEdit() {
      if (menuVm.showMultiStockEdit === false) {
        menuVm.showMultiStockEdit = true;
      } else {
        menuVm.showMultiStockEdit = false;
      }
    }

    function bulkUpdateMultiStock(id) {
      angular.forEach(menuVm.productVariants[id], function(variant) {
        variant = menuVm.stockToUpdate[variant.id];

        if (menuVm.bulkUpdateStock != null) {
          variant.stock = menuVm.bulkUpdateStock;
        }

        if (menuVm.bulkUpdatePrice != null) {
          variant.price = menuVm.bulkUpdatePrice;
        }
        if (menuVm.bulkUpdateOnSale != null) {
          variant.sale = menuVm.bulkUpdateOnSale;
        }
        if (menuVm.bulkUpdateSalePrice != null) {
          variant.sale_price = menuVm.bulkUpdateSalePrice;
        }
      });

      menuVm.bulkUpdateStock = null;
      menuVm.bulkUpdatePrice = null;
      menuVm.bulkUpdateOnSale = false;
      menuVm.bulkUpdateSalePrice = null;
      menuVm.showMultiStockEdit = false;
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
      menuVm.getUnshippedOrders(true);
    }

    function getUnshippedOrders(autohide) {
      menuVm.WooCommerce.get('orders?status=processing&per_page=' + menuVm.userSettings.unshippedCount + '&orderby=id&order=' + menuVm.sortUnshippedOrders, function (err, data, res) {
        Mithril.chest('unshippedOrders', JSON.parse(res));
        menuVm.unshippedOrders = JSON.parse(res);
        menuVm.preorderOrders = {};

        if (autohide === true) {
          Icarus.hide();
        }

        angular.forEach(menuVm.unshippedOrders, function(unshipOrder) {
          angular.forEach(unshipOrder.meta_data, function(unshipOrder) {
            if (unshipOrder.meta_data.key === '_order_has_preorder' && unshipOrder.meta_data.value === 'yes') {
              menuVm.preorderOrders[unshipOrder.id] = unshipOrder;
            }
          })
        })

        $log.log(menuVm.preorderOrders);
      });
      $scope.$broadcast('scroll.refreshComplete');
    }

    function openBulkNotes() {
      menuVm.bulkNotesModal.show();
    }

    function closeBulkNotes() {
      menuVm.bulkNotesModal.hide();
    }

    function openShippingModal(id) {
      $scope.shippingId = id;
      menuVm.trackingOrders[id] = {};
      menuVm.shippingModal.show();
    }

    function closeShippingModal() {
      menuVm.shippingModal.hide();
    }

    function markOrderShipped() {
      var id = $scope.shippingId;
      Icarus.spinner();
      var completion = {
          status: 'completed',
      };

      var trackingInfo = menuVm.trackingOrders[id];

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
          return;
        }

        var trackNote = {
          'note': noteDetails,
          'customer_note': true
        };

        menuVm.WooCommerce.post('orders/' + id + '/notes', trackNote, function(err, data, res) {});
      }

      menuVm.WooCommerce.put('orders/' + id, completion, function (err, data, res) {
        if (res) {
          menuVm.closeShippingModal();
          Icarus.hide();
          Icarus.saved('Order dispatched!', 'typcn typcn-plane rotate-90 icon-flyleft', true, 2000);
          menuVm.getUnshippedOrders(false);

          menuVm.trackingOrders.id = null;
          $scope.shippingId = null;
        }
      });
    }

    function goToSingleStock(product) {
      menuVm.currentProductStock = product;
      menuVm.stockToUpdate = {};
      menuVm.stockUpdating = 'single';

      var single = menuVm.productSingles[product];
      menuVm.stockToUpdate[single.id] = {'stock': single.stock_quantity, 'price': parseFloat(single.regular_price), 'sale': single.on_sale, 'sale_price': parseFloat(single.sale_price)};
      menuVm.currentlyStocking = single;

      $state.go('main.stockUpdate');
    }

    function goToBundleStock(product) {
      menuVm.currentProductStock = product;
      menuVm.stockToUpdate = {};
      menuVm.stockUpdating = 'woosb';

      var single = menuVm.productSingles[product];
      menuVm.stockToUpdate[single.id] = {'stock': single.stock_quantity, 'price': parseFloat(single.regular_price), 'sale': single.on_sale, 'sale_price': parseFloat(single.sale_price)};
      menuVm.currentlyStocking = single;

      $state.go('main.stockUpdate');
    }

    function goToVariantStock(product) {
      menuVm.showMultiStockEdit = false;

      menuVm.currentProductStock = product;
      menuVm.stockToUpdate = {};
      menuVm.stockUpdating = 'variant';

      angular.forEach(menuVm.productVariants[product], function(variant) {
        menuVm.stockToUpdate[variant.id] = {'stock': variant.stock_quantity, 'price': parseFloat(variant.regular_price), 'sale': variant.on_sale, 'sale_price': parseFloat(variant.sale_price)};
      });

      $state.go('main.stockUpdate');
    }

    function updateAllStock() {
      Icarus.spinner();
      angular.forEach(menuVm.stockToUpdate, function(item, id) {

        if (item.manage_stock) {
          if (Mithril.empty(item.stock) || (!angular.isNumber(item.stock))) {
            Icarus.alert('Error Updating Item', 'Invalid value entered');
            return false;
          }
        }

        if (Mithril.empty(item.price) || (!angular.isNumber(item.price))) {
          Icarus.alert('Error Updating Item', 'Invalid value entered');
          return false;
        }

        var stockObj = {
          'stock_quantity': item.stock,
          'regular_price': item.price + '',
        };

        if (item.sale) {
          stockObj['on_sale'] = item.sale;
          stockObj['sale_price'] = item.sale_price + '';
        } else {
          stockObj['on_sale'] = item.sale;
          stockObj['sale_price'] = '';
        }

        menuVm.WooCommerce.put('products/' + menuVm.currentProductStock + '/variations/' + id + '/', stockObj, function (err, data, res) {});
      });

      Icarus.hide();
      Icarus.saved('Product updated!', 'typcn typcn-thumbs-up icon-fadeup', true, 2000);
      menuVm.getAllProducts();

      $state.go('main.stock');
    }
  }
})();
