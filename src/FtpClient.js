define( function (require, exports, module){
	"use strict";

	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeDomain     = brackets.getModule("utils/NodeDomain");

	var Logger       = require("src/Logger"),
		DomainGlobal = require("src/DomainGlobal"),
		FtpDomain    = new NodeDomain(DomainGlobal.WinFtp.domainName, ExtensionUtils.getModulePath(module, "../node/WinFtpDomain"));

	// Setup respond event listener
	FtpDomain.on(DomainGlobal.WinFtp.scriptResult, function(event, response) {
		Logger.consoleDebug("FtpDomain.on("+DomainGlobal.WinFtp.scriptResult+")");
		console.log(response);
	});


	function debug(){
		FtpDomain.exec(DomainGlobal.WinFtp.runScript, "test script");
	}

	exports.debug = debug;

});
