define (function (require, exports) {
	"use strict";

	var Strings     = require("strings"),
		Preferences = require("src/Preferences");

	function consoleDebug(message){
		var debugOn = Preferences.get("debugMode");

		if (debugOn){
			var date = new Date();
			var timeStr = "[" + date.toLocaleTimeString() + "]";

			console.log(Strings.EXT_NAME + "[Debug]" + timeStr + message);
		}
	}

	exports.consoleDebug = consoleDebug;

});
