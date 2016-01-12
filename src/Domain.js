define( function (require, exports, module){
	"use strict";

	var domainName    = 'reEdFtpDomain',
		domainResponse = domainName + '-' + 'response';
	var domainMessage = domainName + '-' + 'msg';

	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeDomain     = brackets.getModule("utils/NodeDomain"),
		File           = brackets.getModule('file/FileUtils'),
		Logger         = require("src/Logger"),
		Common         = require("src/Common"),
		FtpDomain      = new NodeDomain(domainName, ExtensionUtils.getModulePath(module, "../node/FtpDomain"));


	function invokeNode(file, data) {
		Logger.consoleDebug("Domain.invokeNode()");

		var nodeExec;

		if (!Common.isSet(data)){
			nodeExec = FtpDomain.exec("doFtp", getNodeDirectory(), file);
		} else {
			console.log("doFtpStdin");
			nodeExec = FtpDomain.exec("doFtpStdin", getNodeDirectory(), file, data);
		}

		nodeExec.done( function(){
			Logger.consoleDebug("nodeExec.done()");
		});

		nodeExec.fail( function(){
			Logger.consoleDebug("nodeExec.fail()");
		});

		FtpDomain.on(domainResponse, function(event, response){
			Logger.consoleDebug("nodeExec.on("+ domainResponse +")");
			console.log(response);
		});

		FtpDomain.on(domainMessage, function(event, response){
			Logger.consoleDebug("NodeExec.on("+ domainMessage + ")");
			console.log(response);

		});

	}

	function getNodeDirectory() {

		var extensionDirectory = File.getNativeModuleDirectoryPath(module);
		var extensionDirectories = extensionDirectory.split('\/');
		extensionDirectories.pop();
		extensionDirectories.push('node/');
		return extensionDirectories.join('\/');

	}


	function debug(){
		Logger.consoleDebug("Domain.debug()");

		var testScript = [];

		testScript.push('OPEN CA11');
		testScript.push('USER');
		testScript.push('LYZLA01');
		testScript.push('1SHADOW');
		testScript.push('LS /a/lyzla01');
		testScript.push('QUIT');

		var scriptStr = '';
		for (var i = 0; i < testScript.length; i ++){
			scriptStr += testScript[i] + '\n';
		}

		var testFile   = 'scriptFile.txt';

		invokeNode(testFile, scriptStr);

	}

	exports.debug = debug;


});
