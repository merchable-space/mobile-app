'use strict';
( function() {
    angular
      .module('main')
      .factory('TwitterAPI', TwitterAPI);

    function TwitterAPI(
        Mithril,
        Icarus,
        $cordovaOauth

    ) {

        var functions = {
            twitterAuth: twitterAuth,
            twitterTimeline: twitterTimeline
        };

        return functions;

        function twitterAuth() {
            var clientId = 'F0jYvGqWWe4yKLCy6v6iJGtkH';
            var clientSecret = '2mceXKQHf3pX0T92DJrUpXa43FRrYGRNCSr4QD9EZguGDGIq4q';

            $cordovaOauth.twitter(clientId, clientSecret)
            .then(function (succ) {
                $twitterApi.configure(clientId, clientSecret, succ);
            }, function(error) {
                console.log(error);
            });
        }

        function twitterTimeline() {
            $twitterApi.getHomeTimeline({count: 5}).then(function(data) {
                return data;
            }, function(error) {
                console.log('err: ' + error);
            });
        }
    }
})();