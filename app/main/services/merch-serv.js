'use strict';
angular.module('main')
.service('MerchAPI', function ($rootScope, $http) {

    var functions = {
        getUserMeta: getUserMeta
    };

    return functions;

    function getUserMeta() {
        var req = {
            method: 'GET',
            url: 'http://api.merchable.space/get_user_meta.php',
            headers: {
              'app_key': 'xPvttsjSyhgJrpDs2nxVciMwqxKsJLAN'
            }
        };

        return $http(req);
    }

});
