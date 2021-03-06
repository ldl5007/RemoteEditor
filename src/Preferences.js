define( function (require, exports, module) {
    "use strict";


	/**
	 * Bracket modules
	 */
    var _                  = brackets.getModule("thirdparty/lodash"),
		PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
		StateManager       = PreferencesManager.stateManager;

	/**
	 * Extension modules
	 */
	var Globals = require("src/Globals");

	/**
	 * Global variables
	 */

    var defaultPreferences = {
        // features
		/*
        "treatFileWithoutExtentionAsAscii": {
            "type": "boolean",
            "value": true
        },
        "transferAsAsciiTable": {
            "type": 'string',
            "value": '{"tableData":["asm","c","cpp","css","doc","docx","esp","html","git","gradle","java","js","json","less","md","out","pl","py","rb","temp","text","txt"]}'
        },
		*/
		"debugMode": {
			"type": "boolean",
			"value": true
		}
    };


	var prefs = PreferencesManager.getExtensionPrefs(Globals.PRODUCT_PREFIX);

	_.each(defaultPreferences, function (definition, key) {
		if (definition.os && definition.os[brackets.platform]) {
			prefs.definePreference(key, definition.type, definition.os[brackets.platform].value);
		} else {
			prefs.definePreference(key, definition.type, definition.value);
		}
	});
	prefs.save();


    function get(key) {
        var location = defaultPreferences[key] ? PreferencesManager : StateManager;
        arguments[0] = Globals.PRODUCT_PREFIX + "." + key;
        return location.get.apply(location, arguments);
    }

    function set(key) {
        var location = defaultPreferences[key] ? PreferencesManager : StateManager;
        arguments[0] = Globals.PRODUCT_PREFIX + "." + key;
        return location.set.apply(location, arguments);
    }

    function getAll() {
        var obj = {};
        _.each(defaultPreferences, function(definition, key) {
            obj[key] = get(key);
        });
        return obj;
    }

    function getDefaults() {
        var obj = {};
        _.each(defaultPreferences, function(definition, key) {
            var defaultValue;
            if (definition.os && definition.os[brackets.platform]) {
                defaultValue = definition.os[brackets.platform].value;
            } else {
                defaultValue = definition.value;
            }
            obj[key] = defaultValue;
        });
        return obj;
    }

    function getType(key) {
        return defaultPreferences[key].type;
    }

    function getGlobal(key) {
        return PreferencesManager.get(key);
    }

    function persist(key, value) {
        // FUTURE: remote this method
        set(key, value);
        save();
    }

    function save() {
        PreferencesManager.save();
        StateManager.save();
    }

    module.exports = {
        get: get,
        set: set,
        getAll: getAll,
        getDefaults: getDefaults,
        getType: getType,
        getGlobal: getGlobal,
        persist: persist,
        save: save
    };

});
