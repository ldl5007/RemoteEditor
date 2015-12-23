define( function (require, exports, module){
	"use strict";

	var domainName = 'Remote_Editor';

	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
		NodeDomain     = brackets.getModule("utils/NodeDomain"),
		FtpDomain      = new NodeDomain(domainName, ExtensionUtils.getModulePath(module, "../node/FtpDomain"));





});
