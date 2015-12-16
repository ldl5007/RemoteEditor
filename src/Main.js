define(function (require, exports) {
	"use strict";

	var AppInit = brackets.getModule("utils/AppInit");

	var Panel = require("src/Panel");

	var $icon = $("<a id='remote-editor-icon' href='#'></a>")
					.attr("title", String.LOADING)
					.addClass("loading")
					.appendTo($("#main-toolbar .button"));


	function initUi() {
		console.log("Main.initUi()");
		Panel.init();
		$icon.on("click", Panel.toggle);
	}


	function init(){
		console.log("Main.init()")
		AppInit.htmlReady(function() {
			$icon.removeClass("loading").removeAttr("title");


			initUi();

		});
	}

	exports.$icon = $icon;
	exports.init = init;

});
