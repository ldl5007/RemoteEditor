/**
 *
 **/

define (function (require, exports) {
	"user strict";

	var Globals     = require("src/Globals"),
		File        = require("src/FileInfo"),
		Logger      = require("src/Logger"),
		Panel       = require("src/Panel"),
		Common      = require("src/Common"),
		Preferences = require("src/Preferences");

	var PREF_FILE_MANAGER = '.file-manager-';
	var fileInventory = null;

	function init() {
		Logger.consoleDebug("FileManager.init()");

		fileInventory = {};

		var objString = Preferences.get(PREF_FILE_MANAGER) || [];

		if (Common.isSet(objString)) {
			var tempObj = JSON.parse(objString);

			for (var i in tempObj) {
				if (validateFile(tempObj[i])) {
					registerFile(reviseFile(tempObj[i]));
				}
			}
		}
	}


	function registerFile(fileInfo) {
		var returnStatus = false;
		Logger.consoleDebug("FileManager.registerFile()");

		if (validateFile(fileInfo)) {
			fileInventory[fileInfo.getId()] = fileInfo;

			Preferences.set(PREF_FILE_MANAGER, JSON.stringify(fileInventory));
			Preferences.save();

			returnStatus = true;
			Logger.consoleDebug("registered file - " + fileInfo.getLocalPath());
		}

		return returnStatus;
	}

	function removeFile(fileId) {
		Logger.consoleDebug("FileManager.removeFile");
		var file = getFileByLocalPath(fileId);
		if (validateFile(file)){
			delete fileInventory[fileId];

			Preferences.set(PREF_FILE_MANAGER, JSON.stringify(fileInventory));
			Preferences.save();

			Logger.consoleDebug("removed file - " + fileId);
		}
	}

	function reviseFile(object){
		var newFileInfo = new File.FileInfo(object.localPath, object.remotePath, object.remoteServer);

		return newFileInfo;
	}


	function getFileByLocalPath(localPath){
		return fileInventory[localPath];
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

	function getFileArray() {
		var returnArray = [];

		for (var index in fileInventory) {
			returnArray.push(fileInventory[index]);
		}

		return returnArray;
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
	exports.getFileArray = getFileArray;
	exports.init         = init;

});
