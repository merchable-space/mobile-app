'use strict';
angular.module('main')
.controller('MenuCtrl', function (
  $rootScope,
  $cordovaDevice,
  $log
) {

  $rootScope.unshippedProducts = 12;
  $rootScope.lowStockProducts = 3;
  $rootScope.noStockProducts = 4;

  $rootScope.subExpiryDays = 10;

  var thisDevice = $cordovaDevice;
  var thisPlatform = thisDevice.platform;
  $log.log(thisDevice.platform);

  if (thisPlatform !== undefined) {
      $rootScope.getIndex();

      var WooCommerceAPI = require('woocommerce-api');
      var siteUrl = 'https://smai.merchable.space';

      var WooCommerce = new WooCommerceAPI({
        url: siteUrl,
        consumerKey: 'ck_a220189004babc3edee64072a901599918a5ae1d',
        consumerSecret: 'cs_96132571a4754ebd85588138fb3f77984f10176c',
        wpAPI: true,
        version: 'wc/v1'
      });

      $rootScope.getIndex = function() {
        WooCommerce.get('', function(err, data, res) {
          $log.log(res);
        });
      }

      $rootScope.getUnshippedOrders = function() {
        WooCommerce.get('orders?status=processing', function(err, data, res) {
          $log.log(res);
        });
      }

      $rootScope.markOrderShipped = function(id) {
        var completion = {
          status: 'completed'
        };

        WooCommerce.put('orders/' + id, completion, function(err, data, res) {
          $log.log(res);
        });
      }
  }

});
