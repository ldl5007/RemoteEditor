define(function (require, exports){
	"use strict";

	var Dialogs = brackets.getModule("widgets/Dialogs");
	var Strings = require("../strings"),
		Logger  = require("./Logger"),
		Common  = require("./Common"),
		Globals = require('./Globals');

	// debug
	var tree         = require("./tree");

	exports.newDialog  = newDialog;

	/**
	 *
	 **/

	function ListSelectionDialog(inputList, listTitle){
		this.dialogTemplate = require("text!templates/list-selection-dialog.html");
		this.inputList = inputList;
		this.listTitle = listTitle;

		Logger.consoleDebug(this.listTitle);

		this.treeData = tree.newFileTree('ListSelectionDialog');

		for (var i = 0; i < inputList.length; i++){
			this.treeData.addRelativePath(inputList[i], false);
		}
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

			this.setTableTitle(this.listTitle);

			this.refreshTableData(this.treeData);

			this.$dialog
				.on("change", "#dir-text", dirTextChangedHandler);

		} else {
			alert("dialog is already shown");
		}
	};


	/**
	 *
	 **/

	ListSelectionDialog.prototype.setTableTitle = function(inputStr){
		Logger.consoleDebug('ListSelectionDialog.setTableTitle('+inputStr+')');
		$('#dir-text', this.$dialog).val(inputStr);
	};

	/**
	 *
	 **/

	ListSelectionDialog.prototype.refreshTableData = function(treeNode){
		Logger.consoleDebug('ListSelectionDialog.refreshTableData()');
		var $this = $('#list-table', this.$dialog);
		var id    = $this.attr("id");

		if (treeNode.type === Globals.TREE_TYPE_ROOT){
			var tableHtml = tree.generateHtmlTreeContainer(treeNode, id);
			Logger.consoleDebug(treeNode.htmlId);
			$this.html(tableHtml, treeNode.divId);

			var nodeHtml = tree.generateHtmlTreeNode(treeNode);
			$("#" + treeNode.htmlId, this.$dialog).html(nodeHtml);
		}

		formatTreeNode(treeNode, this.$dialog);

		//Reset toggle listeners
		resetTreeToggle(treeNode, this.$dialog);
		resetTreeCheckbox(treeNode, this.$dialog);

		updateSelectedFileCount(treeNode, this.$dialog);
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

	ListSelectionDialog.prototype.checkAll = function(){
		Logger.consoleDebug('ListSelectionDialog.checkAll()');

		$('input:checkbox', this.$dialog).each(function(){
			$(this).prop('checked', true);
		});

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

	/**
	 *
	 **/
	function formatTreeNode(treeNode, $dialog){
		$("*[treeNode]", $dialog).each(function(){
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
		});
	}

	/*
	 *
	 */

	function resetTreeToggle(treeNode, $dialog){
		$("#" + treeNode.htmlId, $dialog).on('click', '.toggle', function () {

			// Get all <tr>'s of the greater depth
			var findChildren = function (tr) {
				var depth = tr.data('depth');
				return tr.nextUntil($('tr').filter(function () {
					return $(this).data('depth') <= depth;
				}));
			};

			var el = $(this);
			var tr = el.closest('tr'); //Get <tr> parent of toggle button
			var trId = tr.attr('id');
			var children = findChildren(tr);

			//Remove already collapsed nodes from children so that we don't
			//make them visible.
			//(Confused? Remove this code and close Item 2, close Item 1
			//then open Item 1 again, then you will understand)
			var subnodes = children.filter('.expand');
			subnodes.each(function () {
				var subnode = $(this);
				var subnodeChildren = findChildren(subnode);
				children = children.not(subnodeChildren);
			});

			//Change icon and hide/show children
			if (tr.hasClass('collapse')) {
				tr.removeClass('collapse').addClass('expand');
				children.hide();
			} else {
				tr.removeClass('expand').addClass('collapse');
				// if the html is not generated then will have to generate and append to the list
				var node = treeNode.getNodeByHtmlId(trId);
				if (node.isNodeHtmlGenerated()){
					children.show();
				} else {
					var nodeHtml = tree.generateHtmlTreeNode(node);
					tr.after(nodeHtml);
					formatTreeNode(node, $dialog);
				}
			}

			return children;
		});
	}

	function resetTreeCheckbox(treeNode, $dialog){
		$("#" + treeNode.htmlId, $dialog).on('click', 'input:checkbox', function () {

			// Get all <tr>'s of the greater depth
			var el = $(this);
			var tr = el.closest('tr'); //Get <tr> parent of toggle button
			var trId = tr.attr('id');

			var checked = el.is(':checked');

			var node = treeNode.getNodeByHtmlId(trId);
			node.isSelected = checked;

			var children = node.getChildren();
			for (var index in children){
				var child = children[index];

				child.isSelected = checked;
				if (child.hasOwnProperty('htmlId')){
					$('#' + child.htmlId + ' input:checkbox', $dialog).prop('checked', checked);
				}
			}

			updateSelectedFileCount(treeNode, $dialog);
		});
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


	function newDialog(inputList, listTitle){
		return new ListSelectionDialog(inputList, listTitle);
	}
});
