/**
 *
 **/

define(function (require, exports) {
	"use strict";

	var Globals = require("src/Globals");

	function FileInfo(localPath, remotePath) {
		this.objId = Globals.OBJECT_ID_FILE_INFO;
		this.localPath  = localPath;
		this.remotePath = remotePath;
	}

	FileInfo.prototype.debugPrint = function() {
		console.log()
	}


	exports.FileInfo = FileInfo;

});
