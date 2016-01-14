(function () {
	'use strict';

	/**
	 * Variables
	 **/
	var _domainManager,
		_domainName = "reEd-WinFtp",
		_runScript    = _domainName + "-runScript",
		_scriptResult = _domainName + '-scriptResult';

	function init(domainManager){
		console.log("WinFtpDomain.init()");

		_domainManager = domainManager;

		console.log("WinFtpDomain.registerDomain(" + _domainName + ")");
		if (!domainManager.hasDomain(_domainName)) {
			domainManager.registerDomain(_domainName, {
				major: 0,
				minor: 1
			});
		}

		console.log("WinFtpDomain.registerCommand("+_runScript+")");
		domainManager.registerCommand(
			_domainName,
			_runScript,
			runScript,
			false,
			"run FTP script",
			[{
				name:'ftpScript',
				type:'string',
				description:'ftp script to be invoke'
			}]
		);

		// Register response event
		console.log("WinFtpDomain.registerEvent(" + _scriptResult + ")");
		domainManager.registerEvent(
			_domainName,
			_scriptResult,
			[{
				name:'responseObj',
				type: 'object',
				description: 'response object'
			}]
		)
	}

	function runScript(script) {
		console.log("WinFtpDomain.runScript("+script+")");

		var result = {
			code: 0,
			data: 'testing'
		};

		console.log(result);

		_domainManager.emitEvent(_domainName, _scriptResult, result);
	}


	exports.init = init;

}());
