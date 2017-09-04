                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    'use strict';
angular.module('main')
.service('API', function ($rootScope, MerchAPI, $cordovaOauth) {

    var userDetails = {};

    var functions = {
        twitterAuth: twitterAuth,
        twitterTimeline: twitterTimeline,
        wooCommerce: wooCommerce
    }

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



    MerchAPI.getUserMeta()
    .then(function (resp) {
        userDetails.userUrl = 'https://' + resp.site_url;
        userDetails.userKey = resp.con_key;
        userDetails.userSecret = resp.con_secret;
    });

    function wooCommerce() {
        var Woocommerce = new WoocommerceAPI({
            url: userDetails.userUrl,
            consumerKey: userDetails.userKey,
            consumerSecret: userDetails.userSecret,
            wpAPI: true,
            version: 'wc/v2'
        });

        return Woocommerce;
    }
});
