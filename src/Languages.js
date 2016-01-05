define(function (require, exports) {
	"use strict";
	var LanguageManager = brackets.getModule("language/LanguageManager");

	//Load our custom language modes
	var esp = require("languages/syntax/esp");

	//Define ESP
	LanguageManager.defineLanguage("esp", {
		name: "ESP",
		mode: "esp",
		fileExtensions: ["esp"],
		blockComment: ["/*", "*/"],
		lineComment: ["-*"]
	});
	
	
});