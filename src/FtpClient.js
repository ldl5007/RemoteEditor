define( function (require, exports, module){
	"use strict";



	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeDomain     = brackets.getModule("utils/NodeDomain"),
		FileUtils      = brackets.getModule("file/FileUtils"),
		FileSystem     = brackets.getModule("filesystem/FileSystem"),
		ProjectManager = brackets.getModule("project/ProjectManager"),
		StringUtils    = brackets.getModule("utils/StringUtils");

	var Logger              = require("src/Logger"),
		ListSelectionDialog = require("src/ListSelectionDialog"),
		DomainGlobal = require("src/DomainGlobal"),
		EventEmitter = require("src/EventEmitter"),
		Events       = require("src/Events"),
		FtpDomain    = new NodeDomain(DomainGlobal.WinFtp.domainName, ExtensionUtils.getModulePath(module, "../node/WinFtpDomain"));

	var _currSite = null,
		_currDialog = null,
		_dirList = [];

	// Setup respond event listener
	FtpDomain.on(DomainGlobal.WinFtp.scriptResult, function(event, response) {
		Logger.consoleDebug("FtpDomain.on("+DomainGlobal.WinFtp.scriptResult+")");

		// Clean up script file
		var scriptFile = FileSystem.getFileForPath(getScriptFilePath());
		ProjectManager.deleteItem(scriptFile);

		if (response.code === 0){
			if (response.scriptId == Events.FTP_CLIENT_CMD_LS){

				console.log(response.stdout);

				var lsOutputObj = parseLsCmdResponse(response.stdout);

				console.log(lsOutputObj);

				for (var index = 0; index < lsOutputObj.dataArr.length; index++ ){
					_currDialog.addFilePath(lsOutputObj.dataArr[index]);
				}

				//	_currDialog.refresh();
				_currDialog.validatePath(lsOutputObj.dir);
				_currDialog.navigateTo(lsOutputObj.dir);
			}
		}

//		EventEmitter.emitFactory(Events.FTP_CLIENT_CMD_RESPOND)(response);
//		console.log(response);
	});

	function generateFtpScript(site, cmdList){
		Logger.consoleDebug("FtpClient.generateFtpScript()");

		var newScript = [];

		// Connection setup
		newScript.push("OPEN " + site.getHostAddr());
		newScript.push("USER");
		newScript.push(site.getUserName());
		newScript.push(site.getPassword());

		// Commands
		for (var index = 0; index < cmdList.length; index++){
			newScript.push(cmdList[index]);
		}

		// Exit
		newScript.push("QUIT");

		// Convert array to script string;
		var scriptStr = "";

		for (var i = 0; i < newScript.length; i++){
			scriptStr += newScript[i] + "\n";
		}

		var scriptFile = getScriptFilePath();
		var newFile = FileSystem.getFileForPath(getScriptFilePath());
		newFile.write(scriptStr);

		return scriptFile;
	}

	/**
	 *
	 **/

	function connect(site) {
		Logger.consoleDebug("FtpClient.connect()");
		_currSite = site;

		_currDialog = ListSelectionDialog.newDialog(_dirList, _currSite.getRootDir());
		_currDialog.show();

		EventEmitter.emitFactory(Events.FTP_CLIENT_CMD_LS)(_currSite.getRootDir());
	}

	/**
	 *
	 **/
	function getScriptFilePath(){
		// Write to file
		var dirStr = FileUtils.getNativeModuleDirectoryPath(module);
		var extDir = dirStr.split("\/");
		extDir.pop();
		extDir.push("scripts/testScript.txt");
		dirStr = extDir.join("\/");

		return dirStr;
	}


	/**
	 *
	 **/

	function parseLsCmdResponse(respStr){
		Logger.consoleDebug("FtpClient.parseLsCmdResponse()");

		var retObj = {};
		var lsOutputArr = [];
		var dirStr = "";
		var newStr = "";
		var isDirStr     = false;
		var isCollecting = false;
		var isSystemZ    = false;

		var strArr = StringUtils.getLines(respStr);
		while(strArr.length > 0){
			newStr = strArr.splice(0, 1)[0];
			newStr = newStr.replace(/(\r\n|\n|\r)/gm,"");

			if (isCollecting){
				lsOutputArr.push(newStr);
			}

			if (isDirStr){
				dirStr = newStr.split('"').splice(1,1);
				retObj.dir = dirStr + '/';
				retObj.dataArr = [];
				isDirStr = false;
			}

			if (newStr.indexOf("PWD") != -1){
				isDirStr = true;
			}

			if (newStr.indexOf("total") != -1){
				isCollecting = true;
			}

			if (newStr.indexOf("LS") != -1){
				isCollecting = false;
			}
		}

		for (var index = 0; index < lsOutputArr.length; index++){
			strArr = lsOutputArr[index].split(/\s+/);
			console.log(strArr);

			// If this is a USS output
			if (!isSystemZ && strArr.length == 9){
				if (strArr[0].indexOf('d') != -1){
					newStr = strArr[strArr.length - 1] + "/";
				} else {
					newStr = strArr[strArr.length - 1];
				}

				retObj.dataArr.push(retObj.dir + newStr);
			}
		}

		return retObj;
	}



	/**
	 *
	 **/
	EventEmitter.on(Events.FTP_CLIENT_CMD_LS, function (listDir) {
		Logger.consoleDebug("FtpClient Event: " + Events.FTP_CLIENT_CMD_LS);

		if (StringUtils.endsWith(listDir, '/')){
			listDir = FileUtils.stripTrailingSlash(listDir);
		}

		var cmdArr = [];
		cmdArr.push("CD " + listDir);
		cmdArr.push("PWD");
		cmdArr.push("LS");

		var scriptFilePath = generateFtpScript(_currSite, cmdArr);
		FtpDomain.exec(DomainGlobal.WinFtp.runScript, Events.FTP_CLIENT_CMD_LS, scriptFilePath);
	});

	exports.connect = connect;

});
