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
		var newFileInfo = new File.FileInfo(object.localPath, object.remotePath, object.remoteServer);

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

		var newFile1 = new File.FileInfo("testing1", "testing2", "testing3");
		var newFile2 = new File.FileInfo("insert", "insert", "insert");

		Panel.insertNewRow(newFile1);
		Panel.insertNewRow(newFile2, 0);
	}



	exports.testingDebug  = testingDebug;

	exports.registerFile = registerFile;
	exports.removeFile   = removeFile;
	exports.validateFile = validateFile;
	exports.init         = init;

});
