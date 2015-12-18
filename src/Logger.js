define (function (require, exports) {
	"use strict";

	var Strings     = require("strings");
	var Preferences = require("src/Preferences");

	function consoleDebug(message){
		var debugOn = Preferences.get("debugMode");

		if (debugOn){
			var date = new Date();
			var timeStr = "[" + date.toLocaleTimeString() + "]";

			console.log(Strings.EXT_NAME + timeStr + message);
		}
	}

	exports.consoleDebug = consoleDebug;

});
