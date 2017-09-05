'use strict';
angular.module('main')
.service('MerchAPI', function (
    $state,
    $rootScope,
    $http,
    Icarus,
    Mithril
) {

    var functions = {
        authWordpressUser: authWordpressUser,
        getUserMeta: getUserMeta,
        getUserSub: getUserSub
    };

    return functions;


    function authWordpressUser(user) {
        return $http.post('https://' + user.store + '.merchable.space/wp-json/jwt-auth/v1/token', {
            username: user.username,
            password: user.password
        })
        .then(function(response) {
            response = response.data;
            if (response.token) {
                Mithril.storage('userWPToken', response.token);
                $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;

                $state.go('main.dashboard');
            }
            else {
                Mithril.storage('userWPToken', null);
                Icarus.alert('Unable To Login', 'Could not validate credentials');
                return false;
            }
        })
        .catch(function(error) {
            Mithril.storage('userWPToken', null);
            if (error.data['status'] === 403) {
                Icarus.alert('Unable To Login', 'Incorrect credentials');
            }
            return false;
        });
    }

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

    function getUserSub() {
        var req = {
            method: 'GET',
            url: 'http://api.merchable.space/get_user_sub.php',
            headers: {
              'app_key': 'xPvttsjSyhgJrpDs2nxVciMwqxKsJLAN'
            }
        };

        return $http(req);
    }

});
