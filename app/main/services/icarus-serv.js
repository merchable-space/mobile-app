/*
 * "Icarus flew too close to the sun, but at least he flew." ― Jeremy Robert Johnson
 *
 * Icarus is an Angular service that can be paired with any m-Ionic based app to create a flexible native pop-up and loader system.
 *
 * Requirements:
 * • cordova-plugin-dialogs - minimum version 1.3.1
 * • main/services/icarus-serv.js to be added into index.html as a dependency
 */

'use strict';
( function() {
    angular
        .module('main')
        .factory('Icarus', Icarus);

    Icarus.$inject = [
        '$ionicLoading',
        '$window'
    ];

    function Icarus(
        $ionicLoading,
        $window
    ) {
        var selfHidden = false;

        // Set list of external functions and return them to the app
        var functionList = {
            alert: alert,
            confirm: confirm,
            prompt: prompt,
            custom: custom,
            show: show,
            spinner: spinner,
            hide: hide
        };
        return functionList;

        /*
         * Triggers an alert popup, with only one button used to dismiss it
         * A function can be added that will be called when the popup is dismissed
         *
         * INPUT: title (str), message (str), button (str), callback (function)
         * RETURNS: N/A
         */
        function alert(title, message, button, callback) {

            if (button === undefined) {
                button = 'OK';
            }

            if (callback === undefined) {
                callback = null;
            }

            navigator.notification.alert(
                message,
                callback,
                title,
                button
            );

        }

        /*
         * Triggers a confirmation popup, with multiple buttons used to dismiss it
         * A function can be added that will be called when the popup is dismissed, passing through the button index (1, 2, 3, etc.)
         *
         * INPUT: title (str), message (str), buttons (array), callback (function)
         * RETURNS: N/A
         */
        function confirm(title, message, buttons, callback) {

            if (buttons === undefined) {
                buttons = [
                    'OK',
                    'Cancel'
                ];
            }

            if (callback === undefined) {
                callback = null;
            }

            navigator.notification.confirm(
                message,
                callback,
                title,
                buttons
            );

        }

        /*
         * Triggers an information popup, with multiple buttons used to dismiss it
         * A function can be added that will be called when the popup is dismissed, passing through the button index (1, 2, 3, etc.).
         * Also passes through input1, which contains the text entered into the field
         *
         * INPUT: title (str), message (str), buttons (array), callback (function), string (str)
         * RETURNS: N/A
         */
        function prompt(title, message, buttons, callback, string) {

            if (buttons === undefined) {
                buttons = [
                    'OK',
                    'Cancel'
                ];
            }

            if (callback === undefined) {
                callback = null;
            }

            if (string === undefined) {
                string = '';
            }

            navigator.notification.prompt(
                message,
                callback,
                title,
                buttons,
                string
            );

        }

        /*
         * Triggers a small custom-styled popup message, with optional auto-close (in milliseconds)
         *
         * INPUT: text (str), dimmer (bool), autoclose (int)
         * RETURNS: N/A
         */
        function custom(text, dimmer, autoclose) {

            if (dimmer === undefined) {
                dimmer = true;
            }

            var content = '<p style="color:#fff;padding:10px 0 0;border-radius:4px;">' + text + '</p>';

            var options = {
                template: content,
                animation: 'fade-in',
                showBackdrop: dimmer,
                maxWidth: 200
            };

            $ionicLoading.show(options);

            if (autoclose) {
                $window.setTimeout(function() {
                    $ionicLoading.hide();
                }, autoclose);
            }
        }

        /*
         * Triggers a small popup message, with optional auto-close (in milliseconds)
         *
         * INPUT: text (str), dimmer (bool), autoclose (int)
         * RETURNS: N/A
         */
        function show(text, dimmer, autoclose) {

            if (text === undefined) {
                spinner();
                return false;
            }

            if (dimmer === undefined) {
                dimmer = true;
            }

            var content = '<p>' + text + '</p>';

            var options = {
                template: content,
                animation: 'fade-in',
                showBackdrop: dimmer
            };

            $ionicLoading.show(options);

            if (autoclose) {
                $window.setTimeout(function() {
                    $ionicLoading.hide();
                }, autoclose);
            }
        }

        /*
         * Triggers a loading icon
         *
         * INPUT: icon (str), colour (str), dimmer (bool)
         * RETURNS: N/A
         */
        function spinner(icon, colour, dimmer, text) {

            selfHidden = false;

            if (icon === undefined) {
                icon = 'lines';
            }

            if (colour === undefined) {
                colour = 'royal';
            }

            if (dimmer === undefined) {
                dimmer = true;
            }

            var spinner = '<ion-spinner icon="' + icon + '" class="spinner-' + colour + '"></ion-spinner>';

            if (text !== undefined) {
                var para = '<p>' + text + '</p>';
                spinner = para + spinner;
            }

            var options = {
                template: spinner,
                animation: 'fade-in',
                showBackdrop: dimmer
            };

            $ionicLoading.show(options);

            // If something takes more than a minute to load (and hasn't been hidden),
            // assume a timeout/error and hide the spinner
            $window.setTimeout(function() {
                if (selfHidden === false) {
                    $ionicLoading.hide();
                }
            }, 60000);
        }

        /*
         * Hides any currently active loading text/spinners
         *
         * INPUT: N/A
         * RETURNS: N/A
         */
        function hide() {
            selfHidden = true;
            $ionicLoading.hide();
        }
    }
})();
