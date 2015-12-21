/**
 *
 **/

define(function (require, exports) {
	"use strict";

	var Globals = require("src/Globals"),
		Logger  = require("src/Logger");

	function FileInfo(localPath, remotePath, remoteServer) {
		this.objId = Globals.OBJECT_ID_FILE_INFO;
		this.localPath    = localPath;
		this.remotePath   = remotePath;
		this.remoteServer = remoteServer;

	}

	function isValid() {
		var returnStatus = false;

		if (typeof this === "object") {
			if (this.hasOwnProperty("objId")){
				if (this.objId === Globals.OBJECT_ID_FILE_INFO){
					returnStatus = true;
				}
			}
		}

		return returnStatus;
	}

	FileInfo.prototype.debugPrint = function() {
		Logger.consoleDebug("objId: " + this.objId);
		Logger.consoleDebug("localPath: " + this.localPath);
		Logger.consoleDebug("remotePath: " + this.remotePath);
		Logger.consoleDebug("remoteServer: " + this.remoteServer);
	}

	function revise(object){
		var newFileInfo = new FileInfo(object.localPath, object.remotePath, object.remoteServer);

		return newFileInfo;
	}

	exports.FileInfo = FileInfo;

});
