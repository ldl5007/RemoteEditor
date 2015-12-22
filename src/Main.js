define(function (require, exports) {
	"use strict";

	var AppInit = brackets.getModule("utils/AppInit");

	var Panel  = require("src/Panel"),
		Logger = require("src/Logger");

	var $icon = $("<a id='remote-editor-icon' href='#'></a>")
					.attr("title", String.LOADING)
					.addClass("loading")
					.appendTo($("#main-toolbar .buttons"));


	function initUi() {
		Logger.consoleDebug("Main.initUi()");
		Panel.init();
		$icon.on("click", Panel.toggle);
	}


	function init(){
		Logger.consoleDebug("Main.init()");
		AppInit.htmlReady(function() {
			$icon.removeClass("loading").removeAttr("title");

			initUi();
		});
	}

	exports.$icon = $icon;
	exports.init = init;

});
