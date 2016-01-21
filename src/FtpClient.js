define( function (require, exports, module){
	"use strict";

	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeDomain     = brackets.getModule("utils/NodeDomain"),
		FileUtils      = brackets.getModule("file/FileUtils"),
		FileSystem     = brackets.getModule("filesystem/FileSystem");

	var Logger       = require("src/Logger"),
		DomainGlobal = require("src/DomainGlobal"),
		EventEmitter = require("src/EventEmitter"),
		Events       = require("src/Events"),
		FtpDomain    = new NodeDomain(DomainGlobal.WinFtp.domainName, ExtensionUtils.getModulePath(module, "../node/WinFtpDomain"));

	// Setup respond event listener
	FtpDomain.on(DomainGlobal.WinFtp.scriptResult, function(event, response) {
		Logger.consoleDebug("FtpDomain.on("+DomainGlobal.WinFtp.scriptResult+")");
		console.log(response);
	});


	function debug(site){
		var scriptFilePath = generateFtpScript(site, ["LS"]);
		console.log(scriptFilePath);

		EventEmitter.emitFactory(Events.FTP_CLIENT_CMD_EXECUTE)(site, "dummy");

		//FtpDomain.exec(DomainGlobal.WinFtp.runScript, "testId", scriptFilePath);

	}

	function generateFtpScript(site, cmdList){
		Logger.consoleDebug("FtpClient.generateFtpScript()");

		var newScript = [];

		// Connection setup
		newScript.push("OPEN " + site.getHostAddr());
		newScript.push("USER");
		newScript.push(site.getUserName());
		newScript.push(site.getPassword());

		newScript.push("CD " + site.getRootDir());

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


		// Write to file
		var dirStr = FileUtils.getNativeModuleDirectoryPath(module);
		var extDir = dirStr.split("\/");
		extDir.pop();
		extDir.push("scripts/testScript.txt");
		dirStr = extDir.join("\/");


		var newFile = FileSystem.getFileForPath(dirStr);
		newFile.write(scriptStr);

		return dirStr;
	}

	EventEmitter.on(Events.FTP_CLIENT_CMD_EXECUTE, function(site, cmdList) {
		console.log(Events.FTP_CLIENT_CMD_EXECUTE);

		console.log(site);
		console.log(cmdList);
	});


	exports.debug = debug;

});
