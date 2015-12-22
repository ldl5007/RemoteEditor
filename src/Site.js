/**
 *  Sites Manager
 */

define(function (require, exports) {
	'use strict';

	var Globals = require("src/Globals"),
		Logger  = require("src/Logger"),
		Strings = require("strings");

	function Site(name, hostAddr, rootDir, userName, password) {
		this.objId = Globals.OBJECT_ID_FTP_SITE;
		this.name = name;
		this.hostAddr = hostAddr;
		this.rootDir = rootDir;
		this.userName = userName;
		this.password = password;
		this.chmodStr = undefined;
        this.remoteOs = undefined;
	}

	Site.prototype.getName = function () {
		return this.name;
	};

	Site.prototype.getHostAddr = function () {
		return this.hostAddr;
	};

	Site.prototype.getRootDir = function () {
		return this.rootDir;
	};

	Site.prototype.getUserName = function () {
		return this.userName;
	};

	Site.prototype.getPassword = function () {
		return this.password;
	};

	Site.prototype.setChmodStr = function (newMode) {
		this.chmodStr = newMode;
	};

	Site.prototype.getChmodStr = function () {
		return this.chmodStr;
	};

    Site.prototype.setRemoteOs = function (newOs) {
        this.remoteOs = newOs;
    };

    Site.prototype.getRemoteOs = function () {
        return this.remoteOs;
    };

	Site.prototype.getCommandId = function () {
		return Globals.COMMAND_RUN_SITE_BASE_ID + this.name;
	};

	Site.prototype.getCommandLabel = function () {
		return Strings.COMMAND_RUN_SITE_BASE_LABEL + this.name;
	};

	Site.prototype.debugPrint = function () {
		Logger.consoleDebug("objId: " + this.objId);
		Logger.consoleDebug("name:  " + this.name);
		Logger.consoleDebug("hostAddr: " + this.hostAddr);
		Logger.consoleDebug("rootDir:  " + this.rootDir);
		Logger.consoleDebug("userName: " + this.userName);
		Logger.consoleDebug("password: " + '**********');
		Logger.consoleDebug("chmodStr: " + this.chmodStr);
        Logger.consoleDebug("remoteOs: " + this.remoteOs);
	};

	function revise(object) {
		var newSite = new Site(object.name,
			object.hostAddr,
			object.rootDir,
			object.userName,
			object.password);

		newSite.setChmodStr(object.chmodStr);

		if (object.hasOwnProperty('remoteOs')){
			newSite.setRemoteOs(object.remoteOs);
		} else {
			newSite.setRemoteOs(Globals.DEFAULT_REMOTE_OS);
		}

		return newSite;
	}

	exports.Site = Site;
	exports.revise = revise;

});
