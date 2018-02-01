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
        getSiteMeta: getSiteMeta,
        getUserMeta: getUserMeta,
        getUserSub: getUserSub,
        getServiceStatus: getServiceStatus,
        getAppUpdate: getAppUpdate,
        registerDevice: registerDevice,
    };

    return functions;


    function authWordpressUser(user) {
        if (user.remember_me) {
            Mithril.storage('userCredentials', user);
        }

        Mithril.storage('userStore', user.store);

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

    function getAppUpdate(version) {
        var req = {
            method: 'GET',
            url: 'https://api.merchable.space/get_app_update.php',
            headers: {
              'version': version,
              'api_key': 'jICLzvKFaCCUFfrGqer9'
            }
        };

        return $http(req);
    }

    function getSiteMeta() {
        var store = Mithril.storage('userStore');

        var req = {
            method: 'GET',
            url: 'https://api.merchable.space/get_site_meta.php',
            headers: {
              'site': store,
              'api_key': 'jICLzvKFaCCUFfrGqer9'
            }
        };

        return $http(req);
    }

    function getUserMeta() {
        var user = Mithril.storage('userCredentials');
        user = user.username;

        var req = {
            method: 'GET',
            url: 'https://api.merchable.space/get_user_meta.php',
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
            url: 'https://api.merchable.space/get_user_sub.php',
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
            url: 'https://api.merchable.space/get_service_status.php',
            headers: {
                'api_key': 'jICLzvKFaCCUFfrGqer9'
            }
        };

        return $http(req);
    }

    function registerDevice() {
        var device = Mithril.storage('userPushId');
        var store = Mithril.storage('userStore');

        if (!Mithril.storage('userPushId')) {
            window.FirebasePlugin.getToken(function(token) {
                Mithril.storage('userPushId', token)
            }, function(error) {
                Icarus.alert('Unable To Register Device', error);
            });
        }

        var req = {
            method: 'GET',
            url: 'https://api.merchable.space/register_device.php',
            headers: {
                'site': store,
                'device': device
            }
        };

        return $http(req);
    }

});
