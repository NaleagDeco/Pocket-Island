/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global KontagentApi */

(function () {
    "use strict";
    var KONTAGENT_API_KEY = 'fac6e85e5563431ea06db108b255f6b3';

    var kontagent_analytics = new KontagentApi(KONTAGENT_API_KEY, {
        'useTestServer': true,
        'validateParams': true
    });

    window.kontagent = kontagent_analytics;
}());