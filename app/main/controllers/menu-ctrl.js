'use strict';
angular.module('main')
.controller('MenuCtrl', function (
  $scope,
  $rootScope,
  $cordovaDevice,
  $log,
  API
) {

  var siteUrl = 'https://merchable.space';
  var WooCommerce = API.WC(siteUrl);

  $rootScope.unshippedProducts = 12;
  $rootScope.lowStockProducts = 3;
  $rootScope.noStockProducts = 4;

  $rootScope.subExpiryDays = 10;

  $log.log($rootScope.deviceDetails);

    $rootScope.getIndex = function () {
      WooCommerce.get('', function (err, data, res) {
        $log.log(res);
      });
    };

    $rootScope.getUnshippedOrders = function () {
      WooCommerce.get('orders?status=processing', function (err, data, res) {
        $log.log(res);
      });
    };

    $rootScope.markOrderShipped = function (id) {
      var completion = {
        status: 'completed'
      };

      WooCommerce.put('orders/' + id, completion, function (err, data, res) {
        $log.log(res);
      });
    };

    $rootScope.getIndex();

});
