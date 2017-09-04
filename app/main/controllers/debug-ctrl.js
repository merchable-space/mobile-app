'use strict';
angular.module('main')
.controller('DebugCtrl', function (
  $log, $http, $timeout, API, Config, $cordovaDevice
) {

  var thisDevice = $cordovaDevice;
  $log.log(thisDevice);

});
