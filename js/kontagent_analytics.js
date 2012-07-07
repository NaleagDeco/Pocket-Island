/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global KontagentApi */

(function () {
    "use strict";
    var KONTAGENT_API_KEY = 'fac6e85e5563431ea06db108b255f6b3';
    var _instance = null;

    var Kontagent = function() {

        if(_instance) {
            throw 'Kontagent was already initialized';
        }
        _instance = this;

       this._api_wrapper = new KontagentApi(KONTAGENT_API_KEY, {
           'useTestServer': true,
           'validateParams': true
       });
    }

    utils.mixin(Kontagent, utils.PubSubMixin);
    utils.mixin(Kontagent, utils.ObservableMixin);

    Kontagent.instance = function() {
        return _instance;
    };

    Kontagent.prototype.initializeSubscriptions = function() {
        this.subscribe("entity/buy", this.trackPurchase);
        this.subscribe("player/level-up", this.trackLevelUp);
        this.subscribe("tutorial/done", this.trackTutorialDone);
        this.subscribe("enemy/kill", this.trackEnemyKilled);
        this.subscribe("contract/start", this.trackContractStarted);
        this.subscribe("contract/collect", this.trackContractRewardCollected);
        this.subscribe("castle/upgrade", this.trackCastleUpgraded);
    };

    Kontagent.prototype.trackPurchase = function(message) {
        kontagent.trackEvent(wooga.castle.playerData.kontagent_id,
            'purchase',
            {
                'subtype1': message.entity.getProperName().replace(/\s/g, '').substring(0,32)
            },
            function () {},
            function(error) {
                window.alert("Could not send purchase EVT due to " + error);
            });
    };

    Kontagent.prototype.trackLevelUp = function(message) {
        kontagent.trackEvent(wooga.castle.playerData.kontagent_id,
            'level_up',
            {
                'level': message.level
            },
            function () {},
            function(error) {
                window.alert("Could not send level-up EVT due to " + error);
            });
    };

    Kontagent.prototype.trackTutorialDone = function(message) {
        kontagent.trackEvent(wooga.castle.playerData.kontagent_id,
            'tutorial_done',
            {},
            function () {},
            function(error) {
                window.alert("Could not send purchase EVT due to " + error);
            });
    };

    Kontagent.prototype.trackEnemyKilled = function(message) {
        kontagent.trackEvent(wooga.castle.playerData.kontagent_id,
            'tutorial_done',
            {},
            function () {},
            function(error) {
                window.alert("Could not send tutorial_done EVT due to " + error);
            });
    };

    Kontagent.prototype.trackContractStarted = function(message) {
        kontagent.trackEvent(wooga.castle.playerData.kontagent_id,
            'contract_started',
            {
                'subtype1': message.entity.getProperName().replace(/\s/g, '').substring(0,32)
            },
            function () {},
            function(error) {
                window.alert("Could not send contract_started EVT due to " + error);
            });
    };

    Kontagent.prototype.trackContractRewardCollected = function(message) {
        kontagent.trackEvent(wooga.castle.playerData.kontagent_id,
            'reward_collected',
            {
                'subtype1': message.entity.getProperName().replace(/\s/g, '').substring(0,32)
            },
            function () {},
            function(error) {
                window.alert("Could not send reward_collected EVT due to " + error);
            });
    };

    Kontagent.prototype.trackCastleUpgraded = function(message) {
        kontagent.trackEvent(wooga.castle.playerData.kontagent_id,
            'castle_upgrade',
            {
                'subtype1': message.entity.getProperName().replace(/\s/g, '').substring(0,32)
            },
            function () {},
            function(error) {
                window.alert("Could not send castle_upgrade EVT due to " + error);
            });
    };

}());