/**
 *
 **/

define (function (require, exports) {
	"user strict";

	var Globals     = require("src/Globals"),
		File        = require("src/FileInfo"),
		Logger      = require("src/Logger"),
		Panel       = require("src/Panel"),
		Preferences = require("src/Preferences");

	var fileInventory = null;

	function init() {

	}


	function registerFile(fileInfo) {


	}

	function removeFile(fileId) {

	}

	function reviseFile(object){
		var newFileInfo = new FileInfo(object.localPath, object.remotePath, object.remoteServer);

		return newFileInfo;
	}

	function validateFile(object) {
		var returnStatus = false;

		if (typeof object === "object") {
			if (object.hasOwnProperty("objId")){
				if (object.objId === Globals.OBJECT_ID_FILE_INFO){
					returnStatus = true;
				}
			}
		}

		return returnStatus;
	}

	function testingDebug() {
		Logger.consoleDebug("testingDebug()");

		var newFile = new File.FileInfo("testing1", "testing2", "testing3");

		Panel.insertNewRow(newFile);
	}

	exports.testingDebug  = testingDebug;

	exports.registerFile = registerFile;
	exports.removeFile   = removeFile;
	exports.validateFile = validateFile;
	exports.init         = init;

});
