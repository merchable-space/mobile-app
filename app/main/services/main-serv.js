'use strict';
( function() {
    angular
      .module('main')
      .factory('API', API);

    function API(
        Mithril,
        Icarus
    ) {

        return {
            WooCommerce: function() {
                Icarus.spinner();
                var Woocommerce = new WoocommerceAPI({
                    url: 'https://' + Mithril.storage('userStore') + '.merchable.space',
                    consumerKey: Mithril.storage('userKey'),
                    consumerSecret: Mithril.storage('userSecret'),
                    wpAPI: true,
                    version: 'wc/v2'
                });

                Icarus.hide();
                return Woocommerce;
            }
        };
    }
})();
