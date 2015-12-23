/**
 *
 **/

define(function (require, exports) {
	"use strict";

	var Globals = require("src/Globals"),
		Logger  = require("src/Logger");

	var fileId = 0;

	function FileInfo(localPath, remotePath, remoteServer) {
		this.objId = Globals.OBJECT_ID_FILE_INFO;
		this.id           = getNewId();
		this.localPath    = localPath;
		this.remotePath   = remotePath;
		this.remoteServer = remoteServer;

	}

	FileInfo.prototype.getId = function() {
		return this.id;
	};

	FileInfo.prototype.getLocalPath = function() {
		return this.localPath;
	};

	FileInfo.prototype.getRemotePath = function() {
		return this.remotePath;
	};

	FileInfo.prototype.getRemoteServer = function() {
		return this.remoteServer;
	};

	FileInfo.prototype.debugPrint = function() {
		Logger.consoleDebug("objId: " + this.objId);
		Logger.consoleDebug("id: " + this.id);
		Logger.consoleDebug("localPath: " + this.localPath);
		Logger.consoleDebug("remotePath: " + this.remotePath);
		Logger.consoleDebug("remoteServer: " + this.remoteServer);
	};

	function getNewId(){
		var returnId = fileId;
		fileId ++;

		return returnId;
	}

	exports.FileInfo = FileInfo;

});
