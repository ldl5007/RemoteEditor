define( function (require, exports, module){
	"use strict";

	var domainName = 'reEd.ftp.domain';

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
			nodeExec = NodeDomain.exec("doFtp", getNodeDirectory(), file);
		} else {
			nodeExec = NodeDomain.exec("doFtpStdin", getNodeDirectory(), file, data);
		}

		nodeExec.done( function(){
			Logger.consoleDebug("nodeExec.done()");
		});

		nodeExec.fail( function(){
			Logger.consoleDebug("nodeExec.fail()");
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
	}

	exports.debug = debug;


});
