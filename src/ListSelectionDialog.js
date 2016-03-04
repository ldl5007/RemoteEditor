define(function (require, exports){
	"use strict";

	var Dialogs   = brackets.getModule("widgets/Dialogs"),
	    FileUtils = brackets.getModule("file/FileUtils"),
		StringUtils = brackets.getModule("utils/StringUtils");
	var Strings      = require("../strings"),
		Logger       = require("./Logger"),
		Common       = require("./Common"),
		Globals      = require('./Globals'),
		EventEmitter = require("./EventEmitter"),
		Events       = require("./Events");

	// debug
	var Tree         = require("./Tree"),
	    TreeNode     = require("./TreeNode");

	var TREE_DIV_ID   = "list-table",
		TREE_TABLE_ID = TREE_DIV_ID + '-tree',
		CURR_PATH_ID  = "dir-text";

	exports.newDialog  = newDialog;

	/**
	 *
	 **/

	function ListSelectionDialog(dlgTitle){
		this.dialogTemplate = require("text!templates/list-selection-dialog.html");
		this._title = dlgTitle;
		this.treeData = Tree.newFileTree('ListSelectionDialog');
	}

	/**
	 *
	 **/


	ListSelectionDialog.prototype.show = function(){
		Logger.consoleDebug('ListSelectionDialog.show()');
		if (!Common.isSet(this.dialog)){
			var compiledTemplate = Mustache.render(this.dialogTemplate, Strings);

			this.dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
			this.$dialog = this.dialog.getElement();

			this.$dialog.on("change", CURR_PATH_ID, dirTextChangedHandler);

		} else {
			alert("dialog is already shown");
		}
	};

	/**
	 *
	 **/

	ListSelectionDialog.prototype.addFilePath = function(newPath){
		Logger.consoleDebug("ListSelectionDialog.addFilePath()");

		this.treeData.addPath(newPath, false);
	};


	/**
	 *  Todo: remove this method sometime later
	 **/

	ListSelectionDialog.prototype.setCurrentPath = function(inputStr){
		Logger.consoleDebug('ListSelectionDialog.setTableTitle('+inputStr+')');
		inputStr = FileUtils.stripTrailingSlash(inputStr);
		$('#' + CURR_PATH_ID, this.$dialog).val(inputStr);
	};

	/**
	 *
	 **/

	ListSelectionDialog.prototype.collapseAll = function(){
		collapseAllTree("#list-table-tree", this.$dialog);
	};

	/**
	 *
	 **/

	ListSelectionDialog.prototype.expandAll = function(){
		expandAllTree("#list-table-tree", this.$dialog);
	};

	/**
	 *
	 **/

	ListSelectionDialog.prototype.getSelectedList = function(){
		Logger.consoleDebug('ListSelectionDialog.getSelectedList()');
		var returnList = [];

		var children = this.treeData.getChildren();
		for (var index in children){
			var child = children[index];

			if (child.type === Globals.TREE_TYPE_FILE && child.isSelected){
			   returnList.push(child.relativePath);
			}
		}

		return returnList;
	};

	/**
	 *
	 **/
	ListSelectionDialog.prototype.refresh = function(){
		Logger.consoleDebug("ListSelectionDialog.refresh()");
		//refreshTableData(this.treeData, this.$dialog);
	};

	/**
	 *
	 **/
	ListSelectionDialog.prototype.navigateTo = function(navPath){
		Logger.consoleDebug("ListSelectionDialog.navigateTo("+navPath+")");

		if (!StringUtils.endsWith(navPath, '/')){
			navPath += '/';
		}

		// Check if navPath existed.
		var navNode = this.treeData.getNodeByPath(navPath);
		if (TreeNode.validate(navNode)){
			this.setCurrentPath(navPath);
			this.expandPath(navPath);
		}
		else{
			alert("Unable to navigate to " + navPath);
			Logger.consoleDebug("Unable to navigate to " + navPath);
		}
	};

	/**
	 *
	 **/

	ListSelectionDialog.prototype.formatTreeNode = function(){
		$(".newNode", this.$dialog).each(function(){
			var $this = $(this),
				type  = $this.attr("type"),
				level = $this.attr("data-depth");

			var padSize = 0;

			var basePadding = $("#list-selection-dialog .level1").css('padding-left');
			if (Common.isSet(basePadding)){
				padSize = Number(basePadding.replace('px','')) * Number(level);
			}

			if (type === 'dir-node'){
				$this.css("padding-left", padSize.toString() + "px");
			} else if (type === 'file-node'){
				var toggleSize = $("#list-selection-dialog .toggle").css('width');
				var togglePad  = $("#list-selection-dialog .toggle").css('padding-right');

				if (Common.isSet(toggleSize) && Common.isSet(togglePad)){
					padSize += Number(toggleSize.replace('px','')) + Number(togglePad.replace('px',''));
				}

				$this.css("padding-left", padSize.toString() + "px");
			}

			$this.removeClass("newNode");
		});
	};

	/*
	 *
	 */

	ListSelectionDialog.prototype.setTreeNodeToggleHandler = function(){
		var that = this;
		this.$dialog.on('click', '.toggle', function() {
			var el = $(this);
			var tr = el.closest('tr'); //Get <tr> parent of toggle button
			var trPath = tr.attr('path');

			//Change icon and hide/show children
			if (tr.hasClass('collapse')) {
				that.collapsePath(trPath);
			} else {
				that.expandPath(trPath);
			}
		});
	};

	ListSelectionDialog.prototype.collapsePath = function(path){
		Logger.consoleDebug("ListSelectionDialog.collapsePath("+path+")");
		var node = this.treeData.getNodeByPath(path);

		if (TreeNode.validate(node) && Common.isSet(node.getHtmlId())){
			$('#' + node.getHtmlId(), this.$dialog).removeClass('collapse').addClass('expand');
			this.hideNode(node);
		}
	};

	ListSelectionDialog.prototype.validatePath = function (path){
		Logger.consoleDebug("ListSelectionDialog.validatePath("+path+")");

		var node = this.treeData.getNodeByPath(path);
		if (TreeNode.validate(node)){
			node.setPathValidate(true);
		}
	};

	ListSelectionDialog.prototype.expandPath = function(path){
		Logger.consoleDebug("ListSelectionDialog.expandPath("+path+")");

		var node = this.treeData.getNodeByPath(path);
		if (TreeNode.validate(node)){
			this.buildTreeNode(node);

			if (!node.isPathValidated()){
				this.hideNode(node);
				EventEmitter.emitFactory(Events.FTP_CLIENT_CMD_LS)(path);
			}
			else {
				$('#' + node.getHtmlId(), this.$dialog).removeClass('expand').addClass('collapse');
				this.showNode(node);

				while (node.getParent()){
					$('#' + node.getParent().getHtmlId(), this.$dialog).removeClass('expand').addClass('collapse');
					node = node.getParent();
				}
			}
		}
	};

	ListSelectionDialog.prototype.hideNode = function(treeNode){
		if (Common.isSet(treeNode.getHtmlId())){
			var children = treeNode.getAllChildren();
			for (var index = 0; index < children.length; index++){
				if (Common.isSet(children[index].getHtmlId())){
					$('#' + children[index].getHtmlId(), this.$dialog).hide();
				}
			}
		}
	};


	ListSelectionDialog.prototype.showNode = function (treeNode) {
		if (Common.isSet(treeNode.getHtmlId())) {
			if ($('#' + treeNode.getHtmlId(), this.$dialog).hasClass('collapse')) {
				var children = treeNode.getChildren();
				for (var index = 0; index < children.length; index++) {
					if (Common.isSet(children[index].getHtmlId)) {
						$('#' + children[index].getHtmlId(), this.$dialog).show();
						this.showNode(children[index]);
					}
				}
			}
		}
	};

	ListSelectionDialog.prototype.buildTreeNode = function (treeNode) {
		var currNode = treeNode;
		var workStack = [];
		var htmlId, html;

		// Search for all of the node that need to generate HTML code
		while (Common.isSet(currNode)) {
			if (!Common.isSet(currNode.getHtmlId())) {
				workStack.push(currNode);
			}

			currNode = currNode.getParent();
		}

		// Generate HTML code
		while (workStack.length > 0) {
			currNode = workStack.pop();

			html = generateHtmlTreeNode(currNode);
			htmlId = this.findPreviousNodeHtmlId(currNode);

			if (htmlId === TREE_TABLE_ID) {
				$('#' + TREE_DIV_ID, this.$dialog).html(generateHtmlTreeContainer(TREE_TABLE_ID));
				$('#' + htmlId, this.$dialog).html(html);
			} else {
				$('#' + htmlId, this.$dialog).after(html);
			}
		}

		var children = treeNode.getChildren();

		for (var index = 0; index < children.length; index++) {
			if (!children[index].getHtmlId()){
				html = generateHtmlTreeNode(children[index]);
				htmlId = this.findPreviousNodeHtmlId(children[index]);
				$('#' + htmlId, this.$dialog).after(html);
			}
		}

		this.formatTreeNode();
		this.setTreeNodeCheckHandler();
		this.setTreeNodeToggleHandler();
	};
	/**
	 *
	 **/

	ListSelectionDialog.prototype.setTreeNodeCheckHandler = function(){
		var that = this;
		this.$dialog.on('click', 'input:checkbox', function () {

			// Get all <tr>'s of the greater depth
			var el = $(this);
			var tr = el.closest('tr'); //Get <tr> parent of toggle button
			var trPath = tr.attr('path');

			var checked = el.is(':checked');

			var node = that.treeData.getNodeByPath(trPath);
			node.setSelected(checked);

			var children = node.getAllChildren();
			for (var index = 0; index < children.length; index++){
				var child = children[index];

				child.setSelected(checked);
				if (Common.isSet(child.getHtmlId())){
					$('#' + child.getHtmlId() + ' input:checkbox', that.$dialog).prop('checked', checked);
				}
			}

			updateSelectedFileCount(that.treeData, that.$dialog);
		});
	};

	/**
	 *
	 **/

	ListSelectionDialog.prototype.checkAll = function(){
		Logger.consoleDebug('ListSelectionDialog.checkAll()');

		$('input:checkbox', this.$dialog).each(function(){
			$(this).prop('checked', true);
		});

	};

	/**
	 *
	 **/
	ListSelectionDialog.prototype.findPreviousNodeHtmlId = function (treeNode){
		Logger.consoleDebug("ListSelectionDialog.findPreviousNodeHtmlId()");
		var htmlId = TREE_TABLE_ID;
		var list = [];

		list.push(this.treeData.getRootNode());
		list = list.concat(this.treeData.getRootNode().getAllChildren());

		for (var index = 0; index < list.length; index++){
			if (list[index].getPath() == treeNode.getPath()){
				break;
			}
			if (Common.isSet(list[index].getHtmlId())){
				htmlId = list[index].getHtmlId();
			}
		}

		return htmlId;
	};

	/**
	 *
	 **/
	function dirTextChangedHandler() {
		Logger.consoleDebug("dirTextChangedHandler()");
	}

	/**
	 *
	 **/
	function updateSelectedFileCount(treeNode, $dialog){
		var selected = treeNode.getSelectedFileCount();
		var total    = treeNode.getTotalFilesCount();

		var dispText = selected + '/' + total + ' ' + Strings.SELECTED;
		Logger.consoleDebug(dispText);
		$('#dialog-status', $dialog).text(dispText);
	}

	/*
	 * Collapse the entire tree
	 */

	function collapseAllTree(treeId, $dialog){
		$(treeId + " tr", $dialog).each(function(){
			var $tr = $(this);
			if ($tr.hasClass('collapse')){
				$tr.find(".toggle").click();
			}
		});
	}

	/*
	 * Expand the entire tree
	 */

	function expandAllTree(treeId, $dialog){
		$(treeId + " tr", $dialog).each(function(){
			var $tr = $(this);
			if ($tr.hasClass('expand')){
				$tr.find(".toggle").click();
			}
		});
	}

	/**
	 *
	 **/

	function generateHtmlTreeContainer(treeId){
		Logger.consoleDebug("ListSelectionDialog.generateHtmlTreeContainer("+treeId+")");

		var html = '<table id="' + treeId + '" class="table table-striped table-bordered">' +
		           '</table>';

		return html;
	}

	/**
	 *
	 **/

	function generateHtmlTreeNode(treeNode){
		Logger.consoleDebug('ListSelectionDialog.generateHtmlTreeNode()');

		var html = '';
		var nodeId = TREE_TABLE_ID + '-' + treeNode.getId();

		treeNode.setHtmlId(nodeId);

		html += '<tr id="' + treeNode.getHtmlId() + '" ' +
		        'data-depth="' + treeNode.getLevel() + '" ' +
		        'class="expand collapsable level' + treeNode.getLevel() + '" ' +
		        'path="' + treeNode.getPath() + '">';

		html += '<td treeNode class="newNode"';
		if (treeNode.isDirectoryNode()){
			html += 'type="dir-node" data-depth="' + treeNode.getLevel() + '"><span class="toggle"></span>';
		}
		else {
			html += 'type="file-node" data-depth="' + treeNode.getLevel() + '">';
		}

		if (treeNode.isSelectable()){
			html += '<input type="checkbox" ';

			if (treeNode.isSelected()){
				html += 'checked';
			}

			html += '/>';
		}

		html += treeNode.getName() + '</td>';

		html += '</tr>';

		return html;
	}

	function newDialog(dlgTitle){
		return new ListSelectionDialog(dlgTitle);
	}
});
