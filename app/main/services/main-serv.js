'use strict';
angular.module('main')
.service('API', function ($rootScope) {
    return {
        WC: function(url){
            var Woocommerce = new WoocommerceAPI({
                url: url,
                consumerKey: 'ck_a220189004babc3edee64072a901599918a5ae1d',
                consumerSecret: 'cs_96132571a4754ebd85588138fb3f77984f10176c',
        wpAPI: true, //or false if you want to use the legacy API v3
          version: 'wc/v2' //or wc/v1
            })
            return Woocommerce;
        }
    }
});
