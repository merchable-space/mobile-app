'use strict';
angular.module('main')
.controller('DebugCtrl', function (
  $log, $http, $timeout, API, Config, $cordovaDevice
) {

  var WooCommerceAPI = require('woocommerce-api');
  var siteUrl = 'https://smai.merchable.space';

  var WooCommerce = new WooCommerceAPI({
    url: siteUrl,
    consumerKey: 'ck_a220189004babc3edee64072a901599918a5ae1d',
    consumerSecret: 'cs_96132571a4754ebd85588138fb3f77984f10176c',
    wpAPI: true,
    version: 'wc/v1'
  });

  this.getUnshippedOrders = function() {
    WooCommerce.get('orders?status=processing', function(err, data, res) {
      console.log(res);
    });
  }

});
