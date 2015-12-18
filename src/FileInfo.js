/**
 *
 **/

define(function (require, exports) {
	"use strict";

	var Globals = require("src/Globals"),
		Logger  = require("src/Logger");

	function FileInfo(localPath, remotePath) {
		this.objId = Globals.OBJECT_ID_FILE_INFO;
		this.localPath  = localPath;
		this.remotePath = remotePath;
	}

	FileInfo.prototype.debugPrint = function() {
		Logger.consoleDebug("objId: " + this.objId);
		Logger.consoleDebug("localPath: " + this.localPath);
		Logger.consoleDebug("remotePath: " + this.remotePath);
	}

	function revise(object){
		var newFileInfo = new FileInfo(object.localPath, object.remotePath);

		return newFileInfo;
	}

	exports.FileInfo = FileInfo;

});
