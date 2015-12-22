/*
 * Remote Editor Panel:
 *   The goal of this panel is to keeping the link between local and remote version of the edit file.
 */

define(function (require, exports) {
	"use strict";

	var WorkspaceManager = brackets.getModule("view/WorkspaceManager");

	var EventEmitter = require("src/EventEmitter"),
		Events       = require("src/Events"),
		FileInfo     = require("src/FileInfo"),
		FileManager  = require("src/FileManager"),
		Main         = require("src/Main"),
		Logger       = require("src/Logger"),
		Strings      = require("strings");

	var reEdPanelTemplate = require("text!templates/remote-editor-panel.html");


	var reEdPanel = null,
		$reEdPanel = $(null),
		reEdPanelDisable = null;

	var tableDiv = 'file-table',
		tableId  = 'testingTable',
		rowPrefix = '';


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
		var panelHtml = Mustache.render(reEdPanelTemplate, Strings);
		var $panelHtml = $(panelHtml);

		reEdPanel = WorkspaceManager.createBottomPanel("brackets-remote-editor.panel", $panelHtml, 100);
		$reEdPanel = reEdPanel.$panel;

		$reEdPanel
			.on("click", ".close",     toggle)
			.on("click", ".check-all", checkAll)
			.on("click", ".add-file",    EventEmitter.emitFactory(Events.PANEL_ADD_FILE))
			.on("click", ".remove-file", EventEmitter.emitFactory(Events.PANEL_REMOVE_FILE));


		initFileTable();
		toggle(true);
	}


	function initFileTable() {
		Logger.consoleDebug("Panel.initFileTable()");

		var html  = '<table id="' + tableId + '" class="table table-striped">';
			html += '</table>';

		rowPrefix = tableId + "-row-";

		// Insert table;
		$("#"+tableDiv, $reEdPanel).html(html);

	}


	function insertNewRow(fileInfo, afterRow){
		Logger.consoleDebug("Panel.insertNewRow()");

		var html = '';

		if (FileManager.validateFile(fileInfo)) {
			var rowId = rowPrefix + fileInfo.getId();

			html += '<tr class="file-row" id="' + rowId + '">';
			html += '<td class="col-1"><input type="checkbox" /></td>';
			html += '<td class="col-2">' + fileInfo.getLocalPath()    +'</td>';
			html += '<td class="col-3">' + fileInfo.getRemotePath()   +'</td>';
			html += '<td class="col-4">' + fileInfo.getRemoteServer() +'</td>';
			html += '</tr>';

			console.log(html);

			// If the after Row does not exist or not matched
			if ($("#"+ tableId + "-" + afterRow, $reEdPanel).length === 0){
				$("#"+ tableId, $reEdPanel).append(html);
			}
			else {
				$("#"+ tableId + "-" + afterRow, $reEdPanel).after(html);
			}
		}
	}

	function deleteRow(fileId){
		Logger.consoleDebug("Panel.deleteRow()");
		var rowId = rowPrefix + fileId;

		$("#"+ rowId, $reEdPanel).remove();
	}

	function checkAll() {
		var status = $('.check-all').is(":checked");

		$('.file-row', $reEdPanel).each(function() {
			$(this).find("input:checkbox").prop('checked', status);
		});
	}

	function getSelectedFiles(){
		var returnList = [];
		var id;

		$(".file-row", $reEdPanel).each(function() {
			id = $(this).attr('id');
			if ($(this).find("input:checked").prop('checked')){
				console.log(id);
				returnList.push(id.replace(rowPrefix, ''));
			}
		});

		return returnList;
	}

	// Events Listeners

	var newFile = null;

	EventEmitter.on(Events.PANEL_ADD_FILE, function() {
		Logger.consoleDebug('Add File Event');

		newFile = new FileInfo.FileInfo("insert", "insert", "insert");

		insertNewRow(newFile);
	});

	EventEmitter.on(Events.PANEL_REMOVE_FILE, function() {
		Logger.consoleDebug('Remove File Event');

		var selFiles = getSelectedFiles();

		for (var index = 0; index < selFiles.length; index++){
			deleteRow(selFiles[index]);
		}

		// clear check all
		$(".check-all", $reEdPanel).prop("checked", false);
	});


	exports.deleteRow    = deleteRow;
	exports.insertNewRow = insertNewRow;
	exports.toggle = toggle;
	exports.init   = init;
});
