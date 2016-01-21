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
			"run FTP script", [{
				name:'scriptId',
				type:'string',
				description:'script unique ID'
			},{
				name:'script',
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
		);
	}

	function runScript(scriptId, script) {
		console.log("WinFtpDomain.runScript(" + scriptId + ")");

		var child;

		var result = {};
		result.stdout = [];
		result.stderr = [];

		result.scriptId = scriptId;

		// Spawn a process to issue the FTP command
		var spawn = require('child_process').spawn;
		var os    = require('os');

		if (os.platform() == 'win32'){
			child = spawn('ftp', ['-ins:' + script]);
		} else {

			// Place holder for other OSs
			child = spawn('cmd.exe', ['dir']);
		}

		child.stdin.end();

		child.stderr.on('data', function (buffer){
			result.stderr.push(buffer.toString());
		});

		child.stdout.on('data', function (buffer){
			result.stdout.push(buffer.toString());
		});

		child.on('close', function(code) {
			result.code = code;

			console.log(result);

			_domainManager.emitEvent(_domainName, _scriptResult, result);
		});
	}


	exports.init = init;

}());
