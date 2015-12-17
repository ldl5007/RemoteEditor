/*
 * Remote Editor Panel:
 *   The goal of this panel is to keeping the link between local and remote version of the edit file.
 */

define(function (require, exports) {
	"use strict";

	var WorkspaceManager = brackets.getModule("view/WorkspaceManager");

	var Main = require("./Main");

	var reEdPanelTemplate = require("text!templates/remote-editor-panel.html");


	var reEdPanel = null,
		$reEdPanel = $(null),
		reEdPanelDisable = null;


	function toggle(bool) {
		console.log("Panel.toggle("+bool+")");
		if (reEdPanelDisable === true){
			return;
		}
		if (typeof bool !== "boolean"){
			bool = !reEdPanel.isVisible();
		}

		Main.$icon.toggleClass("on", bool);
		console.log('setPanel visible');
		reEdPanel.setVisible(bool);
	}


	function init() {
		console.log("Panel.init()");
		// Add panel
		var panelHtml = Mustache.render(reEdPanelTemplate, String);
		var $panelHtml = $(panelHtml);

		reEdPanel = WorkspaceManager.createBottomPanel("brackets-remote-editor.panel", $panelHtml, 100);
		$reEdPanel = reEdPanel.$panel;

		$reEdPanel
			.on("click", ".close", toggle);

		toggle(true);
	}






	exports.toggle = toggle;
	exports.init   = init;
});
