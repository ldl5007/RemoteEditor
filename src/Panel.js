/*
 * Remote Editor Panel:
 *   The goal of this panel is to keeping the link between local and remote version of the edit file.
 */

define(function (require, exports) {
	"use strict";

	var WorkspaceManager = brackets.getModule("view/WorkspaceManager");

	var FileInfo = require("src/FileInfo"),
		Main     = require("./Main"),
		Logger   = require("src/Logger");

	var reEdPanelTemplate = require("text!templates/remote-editor-panel.html");


	var reEdPanel = null,
		$reEdPanel = $(null),
		reEdPanelDisable = null;


	function toggle(bool) {
		Logger.consoleDebug("Panel.toggle(" + bool + ")");
		if (reEdPanelDisable === true){
			return;
		}
		if (typeof bool !== "boolean"){
			bool = !reEdPanel.isVisible();
		}

		Main.$icon.toggleClass("on", bool);
		Logger.consoleDebug("setPanel visible(" + bool +")");
		reEdPanel.setVisible(bool);
	}


	function init() {
		Logger.consoleDebug("Panel.init()");
		// Add panel
		var panelHtml = Mustache.render(reEdPanelTemplate, String);
		var $panelHtml = $(panelHtml);

		reEdPanel = WorkspaceManager.createBottomPanel("brackets-remote-editor.panel", $panelHtml, 100);
		$reEdPanel = reEdPanel.$panel;

		$reEdPanel.on("click", ".close", toggle);

		initFileTable();
		toggle(true);
	}


	function initFileTable() {
		Logger.consoleDebug("Panel.initFileTable()");

		var tableContainer = 'file-table';
		var tableId = 'testingTable';

		var html  = '<table id="' + tableId + '" class=table table-striped table-bordered>';
			html += 'testing table template';

			html += '</table>';

		// Insert table;
		$("#"+tableContainer, $reEdPanel).html(html);

	}


	function insertFileInfo(fileInfo){

	}


	exports.toggle = toggle;
	exports.init   = init;
});
