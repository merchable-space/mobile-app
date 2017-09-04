'use strict';
angular.module('main')
.service('API', function ($rootScope, MerchAPI) {

    var userDetails = {};

    MerchAPI.getUserMeta()
    .then(function (resp) {
        userDetails.userUrl = 'https://' + resp.site_url;
        userDetails.userKey = resp.con_key;
        userDetails.userSecret = resp.con_secret;
    });

    return {
        WC: function(url){
            var Woocommerce = new WoocommerceAPI({
                url: userDetails.userUrl,
                consumerKey: userDetails.userKey,
                consumerSecret: userDetails.userSecret,
                wpAPI: true, //or false if you want to use the legacy API v3
                version: 'wc/v2' //or wc/v1
            })
            return Woocommerce;
        }
    }
});
