define (function (require, exports){
	"use strict";

	var FileUtils = brackets.getModule("file/FileUtils"),
		Common    = require("src/Common"),
		Globals   = require("src/Globals"),
		Logger    = require("src/Logger"),
		TreeNode  = require("src/TreeNode");

	function Tree(name){
		this._name = name;
		this._rootNode = null;
		this._nodeInventory = [];
		this._currentId = 0;
		this._isRowSelectable = true;
	}

	Tree.prototype.isRowSelectable = function(){
		return this._isRowSelectable;
	}

	Tree.prototype.setSeletable = function(isSelectable){
		this._isRowSelectable = isSelectable;
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
	 *
	 **/
	Tree.prototype.isDirectoryNode = function(treeNode){
		var returnStatus = false;

		if (TreeNode.validate(treeNode)){
			var path = treeNode.getPath();

			if (path.endsWith('/')){
				returnStatus = true;
			}
		}

		return returnStatus;
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
			newNode = TreeNode.newTreeNode(name, filePath, this.generateId(), this.isRowSelectable(), isSelected);

			var parentPath = FileUtils.getParentPath(filePath);
			if (parentPath === '/' || parentPath === ''){
				parentNode = TreeNode.newTreeNode(parentPath, parentPath, this.generateId(), this.isRowSelectable(), isSelected);
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

		return newTree;
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

	exports.newFileTree               = newFileTree;
	exports.debugPrint                = debugPrint;

});
