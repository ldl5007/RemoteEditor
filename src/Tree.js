define (function (require, exports){
	"use strict";

	var FileUtils = brackets.getModule("file/FileUtils"),
		Common    = require("src/Common"),
		Globals   = require("src/Globals"),
		Logger    = require("src/Logger"),
		TreeNode  = require("src/TreeNode");

	var nodeId = 0;

	function Tree(name){
		this.parent     = null;
		this.id         = newNodeId();
		this.name       = name || '';
		this.level      = 0;
		this.childDirs  = [];
		this.childFiles = [];

		this.isSelected = false;
		this.isSelectable = true;

		this._rootNode = null;
		this._nodeInventory = [];
		this._currentId = 0;
	}

	Tree.prototype.generateId = function(){
		var id = this._currentId;
		this._currentId++;

		return id;
	};

	Tree.prototype.registerTreeNode = function(treeNode){
		Logger.consoleDebug("Tree.registerTreeNode()");
		if (TreeNode.validate(treeNode)){
			Logger.consoleDebug("Registered: " + treeNode.getPath());
			this._nodeInventory[treeNode.getPath()] = treeNode;

			console.log(this._nodeInventory);
		}
		else{
			Logger.consoleDebug("Unable to register: " + treeNode);
		}
	};

	/**
	 *
	 **/
	Tree.prototype.getNodeByPath = function(path){
		return this._nodeInventory[path];
	};

	/**
	 * Add child directory node to the current node
	 **/
	Tree.prototype.addChildDir = function(dirName, relativePath, isSelected){
		Logger.consoleDebug("Tree.prototype.addChildDir("+dirName+")");
		if (this.getChildDirIndexByName(dirName) === -1){
			var newNode = new Tree(dirName);
			newNode.parent = this;
			newNode.type   = Globals.TREE_TYPE_DIR;
			newNode.level  = this.level + 1;

			newNode.relativePath = relativePath;
			newNode.isSelected = isSelected;

			this.childDirs.push(newNode);
			registerTreeNode(newNode);
		}
	};

	/**
	 * Add child file node to the current node
	 **/
	Tree.prototype.addChildFiles = function(fileName, relativePath, isSelected){
		Logger.consoleDebug("Tree.prototype.addChildFile("+fileName+")");
		// Validate imput
		if (this.getChildFileIndexByName(fileName) === -1){
			var newNode = new Tree(fileName);
			newNode.parent = this;
			newNode.type   = Globals.TREE_TYPE_FILE;
			newNode.level  = this.level + 1;

			newNode.relativePath = relativePath;
			newNode.isSelected   = isSelected;

			this.childFiles.push(newNode);
			registerTreeNode(newNode);
		}
	};

	Tree.prototype.addPath = function(filePath, isSelected){
		Logger.consoleDebug("Tree.addPath("+filePath+")");
		var newNode = this.getNodeByPath(filePath);
		var parentNode = null;
		if (!Common.isSet(newNode)){
			var name = FileUtils.stripTrailingSlash(filePath);
			console.log(name);
			name     = FileUtils.getBaseName(name);
			console.log(name);
			newNode = TreeNode.newTreeNode(name, filePath, this.generateId(), isSelected);

			var parentPath = FileUtils.getParentPath(filePath);
			if (parentPath === '/' || parentPath === ''){
				parentNode = TreeNode.newTreeNode(parentPath, parentPath, this.generateId(), isSelected);
				this.registerTreeNode(parentNode);
				this._rootNode = parentNode;
			}
			else{
				parentNode = this.addPath(parentPath, isSelected);
			}

			parentNode.addChild(newNode);
			this.registerTreeNode(newNode);
		}

		return newNode;
	};

	/**
	 * Build the tree relative path from the root.
	 **/

	Tree.prototype.addRelativePath = function(filePath, isSelected){
		Logger.consoleDebug('Tree.addRelativePath(' + filePath + ')');
		if (typeof filePath !== 'string'){
			return false;
		}

		this.addPath(filePath, isSelected);
		console.log(this._rootNode);

		var currPath = '';

		// parse the input path into an array of directories
		filePath = FileUtils.convertWindowsPathToUnixPath(filePath);
		var listDir = filePath.split('/');
		var currNode = this.getRootNode();
		var nodeName = '';

		Logger.consoleDebug(listDir);

		// Loop through and build the tree
		for (var i = 0; i < listDir.length - 1; i++){
			nodeName = listDir[i];
			if (nodeName === ''){
				nodeName = '/';
			}

			if (currPath === ''){
				currPath = listDir[i];
			} else {
				currPath += currPath + '/' + listDir[i];
			}
			currNode.addChildDir(nodeName, currPath, isSelected);

			currNode = currNode.childDirs[currNode.getChildDirIndexByName(nodeName)];
		}

		var fileName = listDir[listDir.length - 1];
		if (fileName !== ''){
			// The last element of the array is always the file.
			currNode.addChildFiles(listDir[listDir.length - 1], filePath, isSelected);
		}
	};

	/**
	 * Return root node
	 **/
	Tree.prototype.getRootNode = function(){
		var currNode = this;

		while(currNode.type !== Globals.TREE_TYPE_ROOT){
			currNode = currNode.parent;
		}

		return currNode;
	};

	/**
	 *
	 **/
	Tree.prototype.getChildDirIndexByName = function (dirName){
		var retIndex = -1;

		for (var index = 0; index < this.childDirs.length; index++){
			if (this.childDirs[index].name === dirName){
				retIndex = index;
			}
		}

		return retIndex;
	};

	/**
	 *
	 **/
	Tree.prototype.getChildFileIndexByName = function (fileName){
		var retIndex = -1;

		for (var index = 0; index < this.childFiles.length; index++){
			if (this.childFiles[index] === fileName){
				retIndex = index;
			}
		}

		return retIndex;
	};


	/**
	 * Search and return the node that contain the input id
	 **/
	Tree.prototype.getNodeById = function(id){
		var rootNode = this.getRootNode();
		var retNode = rootNode.nodeInventory[id];

		return retNode;
	};

	/**
	 *
	 **/

	Tree.prototype.getNodeByHtmlId = function(htmlId){
		var template = this.getRootNode().htmlId + '-node';
		var nodeId = htmlId.replace(template, '');

		return this.getNodeById(nodeId);
	};

	/**
	 *
	 **/
	Tree.prototype.getChildren = function(){
		Logger.consoleDebug('Tree.getChildren()');
		var children = [];

		for (var dir = 0; dir < this.childDirs.length; dir++){
			children.push(this.childDirs[dir]);
			children = children.concat(this.childDirs[dir].getChildren());
		}

		for (var file = 0; file < this.childFiles.length; file++){
			children.push(this.childFiles[file]);
		}


		return children;
	};

	/**
	 *
	 **/
	Tree.prototype.isNodeHtmlGenerated = function(){
		for (var dir in this.childDirs){
			var childDir = this.childDirs[dir];
			if (!childDir.hasOwnProperty('htmlId')){
				return false;
			}
		}

		for (var file in this.childFiles){
			var childFile = this.childFiles[file];
			if (!childFile.hasOwnProperty('htmlId')){
				return false;
			}
		}

		return true;
	};

	/**
	 *
	 **/
	Tree.prototype.getTotalFilesCount = function(){
		var listNode = this.getRootNode().nodeInventory;
		var retCount = 0;

		for (var index in listNode){
			if (listNode[index].type === Globals.TREE_TYPE_FILE){
				retCount++;
			}
		}

		return retCount;
	};

	/**
	 *
	 **/
	Tree.prototype.getSelectedFileCount = function(){
		var listNode = this.getRootNode().nodeInventory;
		var retCount = 0;

		for (var index in listNode){
			if (listNode[index].type === Globals.TREE_TYPE_FILE && listNode[index].isSelected){
				retCount++;
			}
		}

		return retCount;
	};

	/**
	 * generate new Tree function
	 */

	function newFileTree(rootDir){
		var newTree = new Tree();
		newTree.objType = Globals.OBJECT_DIR_TREE_ID;
		newTree.type = Globals.TREE_TYPE_ROOT;
		newTree.rootDir = rootDir;

		newTree.nodeInventory = [];
		registerTreeNode(newTree);

		return newTree;
	}


	/**
	 *
	 **/

	function generateHtmlTreeContainer(treeNode, treeDiv){
		Logger.consoleDebug("Tree.generateHtmlTreeContainer()");
		var tableId = treeDiv + '-tree';

		var html = '<table id="' + tableId + '" class="table table-striped table-bordered">';
		html += "</table>";

		treeNode.htmlId = tableId;

		return html;
	}

	/**
	 *
	 **/

	function generateHtmlTreeNode(treeNode){
		Logger.consoleDebug('Tree.generateHtmlTreeNode()');

		var nodeId, currNode;
		var html = '';

		// Generate node for directories
		for (var dir = 0; dir < treeNode.childDirs.length; dir++){
			currNode = treeNode.childDirs[dir];
			nodeId = treeNode.getRootNode().htmlId + '-node' + currNode.id ;

			html += '<tr id="' + nodeId + '" ';
			html += 'data-depth="' + treeNode.level + '" class="expand collapsable level' + treeNode.level + '">';

			html += '<td treeNode type="dir-node" data-depth="' + treeNode.level + '"><span class="toggle"></span>';
			html += '<input type="checkbox" ';

			if (currNode.isSelected){
				html += 'checked';
			}

			html += '/>';

			html += currNode.name + '</td>';

			html += '</tr>';

			currNode.htmlId = nodeId;
		}

		// Generate node for files
		for (var file = 0; file < treeNode.childFiles.length; file++){
			currNode = treeNode.childFiles[file];
			nodeId = treeNode.getRootNode().htmlId + '-node' + currNode.id;

			html += '<tr id="' + nodeId + '" ';
			html += 'data-depth="' + treeNode.level + '" class="collapse level' + treeNode.level + '">';

			html += '<td treeNode type="file-node" data-depth="' + treeNode.level + '">';
			if (currNode.isSelectable){
				html += '<input type="checkbox" ';

				if (currNode.isSelected){
					html += 'checked';
				}

				html += '/>';
			}
			html += currNode.name;
			html += '<input type="hidden" value="' + currNode.relativePath + '"/>';
			html += '</td>';
			html += '</tr>';

			currNode.htmlId = nodeId;
		}

		return html;
	}

	/**
	 * debugPrint function
	 **/

	function debugPrint(Tree){
		if (Common.isSet(Tree)){
			Logger.consoleDebug('id:     ' + Tree.id);
			Logger.consoleDebug('type:   ' + Tree.type);
			Logger.consoleDebug('level:  ' + Tree.level);
			Logger.consoleDebug('name:   ' + Tree.name);
			Logger.consoleDebug('parent: ' + Tree.parent);
			Logger.consoleDebug('relativePath: ' + Tree.relativePath);
			Logger.consoleDebug('isSelected: ' + Tree.isSelected);

			for (var child = 0; child < Tree.childFiles; child++){
				Logger.consoleDebug('childFile ' + child + ': ' + Tree.childFiles[child]);
			}

			for (var childDir = 0; childDir < Tree.childDirs.length; childDir++){
				Logger.consoleDebug('childDir ' + childDir + ': ' + Tree.childDirs[childDir]);
				debugPrint(Tree.childDirs[childDir]);
			}
		}
	}

	function registerTreeNode(node){
		Logger.consoleDebug("Tree.registerTreeNode("+node.name+")");
		var rootNode = node.getRootNode();
		rootNode.nodeInventory[node.id] = node;
	}

	function newNodeId(){
		var returnId = nodeId;
		nodeId++;

		return returnId;
	}

	exports.newFileTree               = newFileTree;
	exports.debugPrint                = debugPrint;
	exports.generateHtmlTreeContainer = generateHtmlTreeContainer;
	exports.generateHtmlTreeNode      = generateHtmlTreeNode;

});
