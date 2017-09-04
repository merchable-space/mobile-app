'use strict';
angular.module('main')
.controller('MenuCtrl', function (
  $scope,
  $rootScope,
  $cordovaDevice,
  $log,
  API
) {

  // TWITTER
  API.twitterAuth();

  API.twitterTimeline()
  .then(function (data) {
    console.log('Timeline data:', data);
  });

  // WOOCOMMERCE API
  var WooCommerce = API.wooCommerce();

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


    // VARIABLES BELOW


    $rootScope.unshippedObject = $rootScope.getUnshippedOrders();

    $rootScope.unshippedProducts = $rootScope.unshippedObject.length;
    $rootScope.lowStockProducts = 3;
    $rootScope.noStockProducts = 4;

    $rootScope.subExpiryDays = 10;

    $rootScope.getIndex();

});
