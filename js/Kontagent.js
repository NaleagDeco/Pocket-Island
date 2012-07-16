/*jslint white:true, browser:true, plusplus:true, nomen:true, vars:true */
/*global wooga, KontagentApi */

// In general, I'm using the same style that Wooga used for the majority
// of Pocket Island. I figure they know what they're doing, and it's good
// to be consistent.

// In an ideal world, all code relating to Kontagent instrumentation will be
// here found here (outside of referencing this
// script via index.html, and using the Kontagent-supplied wrapper in
// vendor/kontagent_api.js)
// Unfortunately, due to dependencies that require larger architectural
// changes, I need to instantiate the instance in main.js's initGame()

(function () {
    "use strict";
    // When you set up an application in the Kontagent Dashboard,
    // an API key was generated. This key is required for any
    // Kontagent API call.
    var KONTAGENT_API_KEY = 'fac6e85e5563431ea06db108b255f6b3';
    var KONTAGENT_SESSION_INTERVAL = 30 * 1000; //Thirty seconds
    var _instance = null;

    var utils = wooga.castle.utils;
    var Kontagent = function () {
        if (_instance) {
            // Our Kontagent object should be a singleton
            throw 'Kontagent was already initialized';
        }
        _instance = this;

        // We're utilizing the Kontagent-supplied JavaScript wrapper.
        // We are enabling two options:
        // validateParams: On every Kontagent call, we supply success and failure
        // functions to run if our calls don't pass client-side parameter validation.
        // useTestServer: Kontagent calls will be redirected to a special Kontagent
        // server which does server-side validation. These calls won't be tracked
        // for analytics, because the major use-case is while you're still working
        // out your instrumentation.
        //
        // When you're comfortable with your instrumentation, both of these parameters
        // should be turned off.
        this._api_wrapper = new KontagentApi(KONTAGENT_API_KEY, {
            'useTestServer':true,
            'validateParams':true
        });
        this.initializeSubscriptions();
    };

    utils.mixin(Kontagent, utils.PubSubMixin);

    Kontagent.instance = function() {
        return _instance;
    };

    Kontagent.prototype.initializeSubscriptions = function() {
        /* TODO It feels lame to link against Game just to listen into its
         * I should find out why we aren't just using a global pub/sub mechanism
         * and carving messages up into channels so anyone can respond without
         * unnecessary coupling.
         */
        wooga.castle.Game.instance().subscribe("entity/buy", this.trackPurchase);
        wooga.castle.Game.instance().subscribe("player/level-up", this.trackLevelUp);
        wooga.castle.Game.instance().subscribe("tutorial/done", this.trackTutorialDone);
        wooga.castle.Game.instance().subscribe("enemy/kill", this.trackEnemyKilled);
        wooga.castle.Game.instance().subscribe("contract/start", this.trackContractStarted);
        wooga.castle.Game.instance().subscribe("contract/collect", this.trackContractRewardCollected);
        wooga.castle.Game.instance().subscribe("castle/upgrade", this.trackCastleUpgraded);
        utils.subscribe("game/ready", this.beginTrackingUser);
    };

    Kontagent.prototype.beginTrackingUser = function () {
        // Consider the game startup as an app "installation", since we don't have a nice
        // mechanism like Facebook does.

        // FYI wooga.castle.playerData.kontagent_id was added via Pocket Island's migration framework,
        // see migrations.js
        Kontagent.instance()._api_wrapper.trackApplicationAdded(wooga.castle.playerData.kontagent_id, {},
            function() {},
            function(error) {
                window.alert("Could not send APA message for uid " + wooga.castle.playerData.kontagent_id + ": " + error);
            });
        // Once the game starts, we want to regularly send signals to Kontagent so that we can
        // gauge whether the game is still running. Because Pocket Island continues running even if we aren't
        // sending out page requests, we will create a thread that sends off a signal to Kontagent every so many
        // seconds.
        // The server will work out, from the timing of these messages, the "gaming sessions" of this user.
        window.setInterval(function () {
            Kontagent.instance()._api_wrapper.trackPageRequest(wooga.castle.playerData.kontagent_id, {},
                function () {
                },
                function (error) {
                    window.alert("Could not send PGR message for uid " + wooga.castle.playerData.kontagent_id + ": " + error);
                });
        }, KONTAGENT_SESSION_INTERVAL);
    };

    Kontagent.prototype.trackPurchase = function(message) {
        // This is an example of sending an 'event' message. We could have used up to three 'subtype' levels.
        // You do want these events to fit into some kind of bucket, if you want to capture more unique information
        // about every event you should consider the optional 'data' parameter, as otherwise you'll clog up the
        // dashboard interface with events that can't be chopped and diced in any meaningful way.
        Kontagent.instance()._api_wrapper.trackEvent(wooga.castle.playerData.kontagent_id,
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
        Kontagent.instance()._api_wrapper.trackEvent(wooga.castle.playerData.kontagent_id,
            'level_up',
            {
                'level': message.level
            },
            function () {},
            function(error) {
                window.alert("Could not send level-up EVT due to " + error);
            });
    };

    Kontagent.prototype.trackTutorialDone = function() {
        Kontagent.instance()._api_wrapper.trackEvent(wooga.castle.playerData.kontagent_id,
            'tutorial_done',
            {},
            function () {},
            function(error) {
                window.alert("Could not send purchase EVT due to " + error);
            });
    };

    Kontagent.prototype.trackEnemyKilled = function() {
        Kontagent.instance()._api_wrapper.trackEvent(wooga.castle.playerData.kontagent_id,
            'enemy_killed',
            {},
            function () {},
            function(error) {
                window.alert("Could not send tutorial_done EVT due to " + error);
            });
    };

    Kontagent.prototype.trackContractStarted = function(message) {
        Kontagent.instance()._api_wrapper.trackEvent(wooga.castle.playerData.kontagent_id,
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
        Kontagent.instance()._api_wrapper.trackEvent(wooga.castle.playerData.kontagent_id,
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
        Kontagent.instance()._api_wrapper.trackEvent(wooga.castle.playerData.kontagent_id,
            'castle_upgrade',
            {
                'subtype1': message.entity.getProperName().replace(/\s/g, '').substring(0,32)
            },
            function () {},
            function(error) {
                window.alert("Could not send castle_upgrade EVT due to " + error);
            });
    };

    wooga.castle.Kontagent = Kontagent;
}());
