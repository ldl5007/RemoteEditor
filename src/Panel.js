/*
 * Remote Editor Panel:
 *   The goal of this panel is to keeping the link between local and remote version of the edit file.
 */

define(function (require, exports) {
	"use strict";

	var WorkspaceManager = brackets.getModule("view/WorkspaceManager");

	var FileInfo    = require("src/FileInfo"),
		FileManager = require("src/FileManager"),
		Main        = require("./Main"),
		Logger      = require("src/Logger");

	var reEdPanelTemplate = require("text!templates/remote-editor-panel.html");


	var reEdPanel = null,
		$reEdPanel = $(null),
		reEdPanelDisable = null;

	var tableDiv = 'file-table',
		tableId  = 'testingTable';


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

		var html  = '<table id="' + tableId + '" class="table table-striped">';
			html += '<tr class="file-row" id="' + tableId + '-header">';
			html += '<th><input type="checkbox" /></th>';
			html += '<th>Local Path</th>';
			html += '<th>Remote Path</th>';
			html += '<th>Remote Server</th></tr>';
			html += '</table>';

		// Insert table;
		$("#"+tableDiv, $reEdPanel).html(html);

	}


	function insertNewRow(fileInfo, afterRow){
		Logger.consoleDebug("Panel.insertNewRow()");

		var html = '';
		var rowId = tableId + '-';

		if (FileManager.validateFile(fileInfo)) {
			rowId += fileInfo.getId();

			html += '<tr class="file-row" id="' + rowId + '">';
			html += '<td class="col-1"><input type="checkbox" /></td>';
			html += '<td class="col-2">' + fileInfo.getLocalPath()    +'</td>';
			html += '<td class="col-3">' + fileInfo.getRemotePath()   +'</td>';
			html += '<td class="col-4">' + fileInfo.getRemoteServer() +'</td>';
			html += '</tr>';

			console.log(html);

			// If the after Row does not exist or not matched
			console.log($("#"+ tableId + "-" + afterRow, $reEdPanel));

			if ($("#"+ tableId + "-" + afterRow, $reEdPanel).length == 0){
				$("#"+ tableId, $reEdPanel).append(html);
			}
			else {
				$("#"+ tableId + "-" + afterRow, $reEdPanel).after(html);
			}
		}
	}


	exports.insertNewRow = insertNewRow;
	exports.toggle = toggle;
	exports.init   = init;
});
