/**
 *  Sites Manager
 */


define(function (require, exports) {
	'use strict';

	var Common      = require("src/Common"),
		Globals     = require("src/Globals"),
		Logger      = require("src/Logger"),
		Preferences = require("src/Preferences"),
		Site        = require("src/Site");

	var PREF_SITES_MANAGER = '.sites-manager-';
	var sitesManager;

	function init() {
		Logger.consoleDebug('SiteManager.init();');

		sitesManager = {};

		var objString = Preferences.get(PREF_SITES_MANAGER) || [];


		if (Common.isSet(objString)) {
			var tempObj = JSON.parse(objString);

			for (var i in tempObj) {
				if (validateSite(tempObj[i])) {
					registerSite(Site.revise(tempObj[i]));
				}
			}
		}
	}

	function registerSite(newSite) {

		var returnStatus = false;

		if (validateSite(newSite)) {
			sitesManager[newSite.name] = newSite;

			// Update preferences
			Preferences.set(PREF_SITES_MANAGER, JSON.stringify(sitesManager));
			Preferences.save();

			returnStatus = true;

			Logger.consoleDebug('Site registered - ' + newSite.name);

		}

		return returnStatus;
	}


	function removeSite(siteName) {
		var returnStatus = false;

		var site = getSiteByName(siteName);
		if (validateSite(site)) {
			delete sitesManager[siteName];

			Preferences.set(PREF_SITES_MANAGER, JSON.stringify(sitesManager));
			Preferences.save();
		}

		return returnStatus;
	}


	function getSiteByName(name) {
		return sitesManager[name];
	}

	function isSiteExisted(name) {
		return validateSite(sitesManager[name]);
	}

	function getSitesArray() {
		var sitesArray = [];

		for (var name in sitesManager) {
			sitesArray.push(sitesManager[name]);
		}

		return sitesArray;
	}

	function validateSite(inputSite) {

		// Check if inputSite is an object
		if (typeof inputSite !== 'object') {
			return false;
		}

		// Check if object have objId property
		if (!inputSite.hasOwnProperty("objId")) {
			return false;
		}

		// Check if the object ID is correct
		if (inputSite.objId !== Globals.OBJECT_ID_FTP_SITE) {
			return false;
		}

		return true;
	}

	function newSite(name, hostAddr, rootDir, userName, password) {
		return new Site.Site(name, hostAddr, rootDir, userName, password);
	}

	exports.init = init;
	exports.registerSite = registerSite;
	exports.removeSite = removeSite;
	exports.getSitesArray = getSitesArray;
	exports.getSiteByName = getSiteByName;
	exports.isSiteExisted = isSiteExisted;
	exports.newSite = newSite;
	exports.validateSite = validateSite;

});
