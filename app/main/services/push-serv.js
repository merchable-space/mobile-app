'use strict';
angular.module('main')
.service('PushAPI', function (
    $state,
    $rootScope,
    $http,
    $cordovaDevice,
    Icarus,
    Mithril
) {

    var functions = {
        registerDevice: registerDevice,
        unregisterDevice: unregisterDevice,
        registerUser: registerUser,
        optIn: optIn,
        optOut: optOut
    };

    return functions;


    function registerDevice() {
        var deviceUuid = $cordovaDevice.getUUID();
        return $http.post('https://cp.pushwoosh.com/json/1.3/registerDevice', {
            "request":{
                "application":"E3824-10890",
                "push_token":"s2ZUqpDFemCQKlQV4xIABDmNd7ZxRTZOBxHLBlR42nXL0xF4mXErtqaWcGJ1piPgFHtpb5Shoryll9W3Brgq",
                "hwid": deviceUuid,
                "device_type": 3 //Always Android, so 3 - iOS is 1
            }
        });
    }

    function unregisterDevice() {
        var deviceUuid = $cordovaDevice.getUUID();
        return $http.post('https://cp.pushwoosh.com/json/1.3/unregisterDevice', {
            "request":{
                "application":"E3824-10890",
                "hwid": deviceUuid
            }
        });
    }

    function registerUser() {
        var deviceUuid = $cordovaDevice.getUUID();
        var userUuid = Mithril.storage('userPushId');
        return $http.post('https://cp.pushwoosh.com/json/1.3/registerUser', {
            "request":{
                "userId": userUuid,
                "application": "E3824-10890",
                "hwid": deviceUuid,
                "device_type": 3
            }
        });
    }

    function optIn() {
        var deviceUuid = $cordovaDevice.getUUID();
        return $http.post('https://cp.pushwoosh.com/json/1.3/setTags', {
            "request":{
                "application":"E3824-10890",
                "hwid": deviceUuid,
                "tags": {
                    "Push Opt-In": true
                }
            }
        });
    }

    function optOut() {
        var deviceUuid = $cordovaDevice.getUUID();
        return $http.post('https://cp.pushwoosh.com/json/1.3/registerUser', {
            "request":{
                "application":"E3824-10890",
                "hwid": deviceUuid,
                "tags": {
                    "Push Opt-In": false
                }
            }
        });
    }

});
