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
        getUserSub: getUserSub,
        getServiceStatus: getServiceStatus
    };

    return functions;


    function authWordpressUser(user) {
        if (user.remember_me) {
            Mithril.storage('userCredentials', user);
        }
        return $http.post('https://' + user.store + '.merchable.space/wp-json/jwt-auth/v1/token', {
            username: user.username,
            password: user.password
        })
        .then(function(response) {
            response = response.data;
            if (response.token) {
                Mithril.storage('userWPToken', response.token);
                Mithril.storage('userWPHeader', 'Bearer ' + response.token);
                $http.defaults.headers.common['WP-Authoriser'] = Mithril.storage('userWPHeader');

                $state.go('main.dashboard');
            }
            else {
                Mithril.storage('userWPToken', null);
                Icarus.hide();
                Icarus.alert('Unable To Login', 'Could not validate credentials');
                return false;
            }
        })
        .catch(function(error) {
            error = error.data;
            Icarus.hide();

            Mithril.storage('userWPToken', null);

            Icarus.alert('Unable To Login', error.message);
            return false;
        });
    }

    function getUserMeta() {
        var user = Mithril.storage('userCredentials');
        user = user.username;

        var req = {
            method: 'GET',
            url: 'http://api.merchable.space/get_user_meta.php',
            headers: {
              'username': user,
              'api_key': 'jICLzvKFaCCUFfrGqer9'
            }
        };

        return $http(req);
    }

    function getUserSub() {
        var user = Mithril.storage('userId');

        var req = {
            method: 'GET',
            url: 'http://api.merchable.space/get_user_sub.php',
            headers: {
                'user_id': user,
                'api_key': 'jICLzvKFaCCUFfrGqer9'
            }
        };

        return $http(req);
    }

    function getServiceStatus() {
        var req = {
            method: 'GET',
            url: 'http://api.merchable.space/get_service_status.php',
            headers: {
                'api_key': 'jICLzvKFaCCUFfrGqer9'
            }
        };

        return $http(req);
    }

});
