/*
 * "Mithril! [...] the Dwarves could make of it a metal, light and yet harder than tempered steel."
 *
 * Mithril is a lightweight Angular service that can be paired with any m-Ionic based app to create a tight-knit security wrapper.
 * It handles things like logging in via an API, checking permissions against the ID247 platform, and sending errors to our analytics system.
 *
 * Requirements:
 * • cordova-plugin-device - minimum version 1.1.3 [npm]
 * • ngstorage - minimum version 0.3.11, and required via main.js as 'ngStorage' [Bower]
 * • main/services/mithril-serv.js to be added into index.html as a dependency
 */

'use strict';
( function() {
    angular
        .module('main')
        .factory('Mithril', Mithril);

    Mithril.$inject = [
        '$http',
        '$window',
        '$ionicHistory',
        '$state',
        '$cordovaDevice',
        '$localStorage',
        '$sessionStorage'
    ];

    function Mithril(
        $http,
        $window,
        $ionicHistory,
        $state,
        $cordovaDevice,
        $localStorage,
        $sessionStorage
    ) {

        // Instantiate some local storage to use later
        var armoury = $localStorage;

        // Grab some device information, so we don't need to do it repeatedly
        // We have to declare them first then set them to keep ESLint happy
        // var platformDevice = '';
        // var platformModel =  '';
        // var platformOs =  '';
        // var platformVersion =  '';

        // ionic.Platform.ready(function() {
        //     platformDevice = $cordovaDevice.getUUID();
        //     platformModel =  $cordovaDevice.getModel();
        //     platformOs =  $cordovaDevice.getPlatform();
        //     platformVersion =  $cordovaDevice.getVersion();
        // });

        // Set list of external functions and return them to the app
        var functionList = {
            login: login,
            logout: logout,
            token: token,
            random: random,
            storage: storage,
            chest: chest,
            pandora: pandora,
            destroy: destroy,
            wipeout: wipeout,
            blitz: blitz
        };
        return functionList;

        /*
         * Authorise a user via the platform API
         *
         * INPUT: username (str), password (str)
         * RETURNS: $http (object)
         */
        function login(username, password) {

            return $http.get(storage('urlFull') +
            '/api/auth', {
                method: 'GET',
                headers: {
                    username: username,
                    password: password
                }
            });

        }

        /*
         * Log a user out of the app
         *
         * INPUT: rememberMe (bool)
         * RETURNS: N/A
         */
        function logout(rememberMe) {

            if (rememberMe) {
                // Pull the URL and username into local variables
                var url = storage('urlShort');
                var username = storage('userName');
            }

            // Clear Localstorage
            wipeout();

            if (rememberMe) {
                // Re-populate Localstorage with values
                storage('urlShort', url);
                storage('userName', username);
            }

            // Clear caches and history before redirecting to login page
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go('login');

        }

        /*
         * Verifies a user token
         *
         * INPUT: N/A
         * RETURNS: tokenCheck (bool)
         */
        function token() {

            return $http.get(storage('urlFull') +
            '/api/validate_token', {
                method: 'GET',
                headers: {
                    username: storage('userName'),
                    key: storage('userToken')
                }
            }).then(function(tokenCheck) {

                // Consolidate the response into the one variable we care about
                tokenCheck = tokenCheck.data;

                var pwdChanged = tokenCheck.password_needs_change;
                var tokenValid = tokenCheck.is_valid;

                if (pwdChanged) {
                    Mithril.storage('pwdResetMessage', 'You have been requested to change your password');
                    $state.go('app.pwdChange', {'selfReset': false});
                }

                // Send back the token check: true or false
                return tokenValid;

            });

        }


        /*
         * Returns a random alphanumeric string
         *
         * INPUT: length (int)
         * RETURNS: random (str)
         */
        function random(length) {
            if (length === undefined) {
                length = 16;
            }

            var possChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789';

            Array(length).join().split(',').map(function() {
                return possChars.charAt(Math.floor(Math.random() * possChars.length));
            }).join('');
        }

        /*
         * A sleeker, self-contained variant of a Localstorage service
         *
         * INPUT: key (str), value (str)
         * RETURNS: value (str)
         */
        function storage(key, value) {
            if (!value) {
                if (key in armoury) {
                    return armoury[key];
                }
                else {
                    return false;
                }
            }
            else {
                return armoury[key] = value ;
            }
        }

        /*
         * Returns something stored in the appCache string
         *
         * INPUT: value (str)
         * RETURNS: value (str)
         */
        function chest(key, value) {
            // If the cache is null or doesn't exist, make it here
            if (!storage('appCache')) {
                storage('appCache', {});
            }

            var cachedData = storage('appCache');

            if (!key && !value) {
                return cachedData;
            }

            if (!value) {
                if (key in cachedData) {
                    return cachedData[key];
                }
                else {
                    return false;
                }
            }
            else {
                cachedData[key] = value;
                storage('appCache', cachedData);
            }
        }

        /*
         * Removes a key from the armoury
         *
         * INPUT: key (str)
         * RETURNS: value (str)
         */
        function destroy(key) {
            armoury[key] = null;
        }

        /*
         * Outputs the contents of the armoury storage
         *
         * INPUT: N/A
         * RETURNS: consoles
         */
        function pandora() {
            return armoury;
        }

        /*
         * Clears the contents of the armoury
         *
         * INPUT: N/A
         * RETURNS: N/A
         */
        function wipeout() {
            if (storage('dataCache')) {
                var cacheKeeper = storage('appCache');
                armoury.$reset({
                    appCache: cacheKeeper
                });
            }
            else {
                armoury.$reset();
            }
        }

        /*
         * Clears the contents of the armoury, without checking for data caching bool
         *
         * INPUT: N/A
         * RETURNS: N/A
         */
        function blitz() {
            armoury.$reset();
        }
    }
})();
