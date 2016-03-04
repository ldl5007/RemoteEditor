define (function (require, exports){
	"use strict";

	var StringUtils = brackets.getModule("utils/StringUtils"),
		Common = require("src/Common"),
		Globals = require("src/Globals"),
		Logger  = require("src/Logger");

	function TreeNode(name, path, id, isSelectable, isSelected){

		this._objType = Globals.OBJECT_ID_TREE_NODE;
		this._parent = null;
		this._name   = name;
		this._id     = id;
		this._path   = path;
		this._level  = 0;
		this._htmlId = null;
		this._children = [];

		this._isSelectable = isSelectable;
		this._isSelected  = isSelected;
		this._isPathValidated = false;
	}

	/**
	 * Resources getting methods
	 **/
	TreeNode.prototype.getParent = function(){
		return this._parent;
	};

	TreeNode.prototype.getName   = function(){
		return this._name;
	};

	TreeNode.prototype.getId = function(){
		return this._id;
	};

	TreeNode.prototype.getPath   = function(){
		return this._path;
	};

	TreeNode.prototype.getLevel  = function(){
		return this._level;
	};

	TreeNode.prototype.getHtmlId = function(){
		return this._htmlId;
	};

	TreeNode.prototype.getChildren = function(){
		var dirList = [];
		var fileList = [];
		var retList  = [];

		for (var child = 0; child < this._children.length; child++){
			if (this._children[child].isDirectoryNode()){
				dirList.push(this._children[child]);
			}
			else {
				fileList.push(this._children[child]);
			}
		}

		dirList  = dirList.sort (function (a,b) {return a.getPath().localeCompare(b.getPath());});
		fileList = fileList.sort(function (a,b) {return a.getPath().localeCompare(b.getPath());});

		retList = dirList.concat(fileList);

		return retList;
	};

	TreeNode.prototype.isSelectable = function(){
		return this._isSelectable;
	};

	TreeNode.prototype.isSelected = function(){
		return this._isSelected;
	};

	TreeNode.prototype.isPathValidated = function (){
		return this._isPathValidated;
	};

	/**
	 * Resource assigning methods
	 **/
	TreeNode.prototype.setParent = function(parent){
		this._parent = parent;
	};

	TreeNode.prototype.setName   = function(name){
		this._name = name;
	};

	TreeNode.prototype.setPath = function(path){
		this._path = path;
	};

	TreeNode.prototype.setLevel = function(level){
		this._level = level;
	};

	TreeNode.prototype.setHtmlId = function(htmlId){
		this._htmlId = htmlId;
	};

	TreeNode.prototype.setSeletable = function(selectable){
		this._isSelectable = selectable;
	};

	TreeNode.prototype.setSelected = function(selected){
		this._isSelected = selected;
	};

	TreeNode.prototype.setPathValidate = function(status){
		this._isPathValidated = status;
	};

	/**
	 * Return root node of the current node.
	 **/

	TreeNode.prototype.getRootNode = function(){
		var rootNode = this;

		while (Common.isSet(rootNode.getParent())){
			rootNode = rootNode.getParent();
		}

		return rootNode;
	};

	/**
	 * Update Tree level structure
	 **/
	TreeNode.prototype.refreshLevelStructure = function(){
		var allChildren = this.getAllChildren();
		var child = null;

		for (var index = 0; index < allChildren.length; index++){
			child = allChildren[index];
			child.setLevel(child.getParent().getLevel() + 1);
		}
	};


	/**
	 *
	 **/

	TreeNode.prototype.addChild = function (childNode){
		Logger.consoleDebug("TreeNode.addChild("+childNode.getName()+")");

		var isNewChild = true;

		// Check if child Node is already existed.
		for (var child = 0; child < this._children.length; child++){
			if (this._children[child].getPath() == childNode.getPath()){
				isNewChild = false;
			}
		}

		// if is new child then add to the list.
		if (isNewChild){
			childNode.setParent(this);
			this._children.push(childNode);
			this.refreshLevelStructure();
		}
		else {
			Logger.consoleDebug("child " + childNode.getName() + " already existed");
		}
	};

	/**
	 *
	 **/
	TreeNode.prototype.getAllChildren = function(){
		Logger.consoleDebug("TreeNode.getAllChildren()");
		var children = this.getChildren();
		var child, grandChildren, firstHaft, secondHaft;

		for(var index = 0; index < children.length; index++){

			child = children[index];
			grandChildren = child.getAllChildren();
			if (grandChildren.length > 0){

				console.log(children);

				firstHaft  = children.slice(0, index + 1);
				secondHaft = children.slice(index + 1, children.length);

				children = firstHaft.concat(grandChildren, secondHaft);
				index += grandChildren.length;
			}
		}

		return children;
	};

	/**
	 *
	 **/
	TreeNode.prototype.isDirectoryNode = function(){
		var returnStatus = false;

		if (StringUtils.endsWith(this.getPath(), '/')){
			returnStatus = true;
		}

		return returnStatus;
	};

	TreeNode.prototype.debugPrint = function(){
		Logger.consoleDebug("TreeNode.debugPrint()");
		Logger.consoleDebug('parent:    ' + this.getParent());
		Logger.consoleDebug('name:      ' + this.getName());
		Logger.consoleDebug('id:        ' + this.getId());
		Logger.consoleDebug('path:      ' + this.getPath());
		Logger.consoleDebug('level:     ' + this.getLevel());
		Logger.consoleDebug('htmlId:    ' + this.getHtmlId());
		Logger.consoleDebug('isSelectable:' + this.isSelectable());
		Logger.consoleDebug('isSeleted:   ' + this.isSelected());
		Logger.consoleDebug('isPathValidated ' + this.isPathValidated());

		var children = this.getChildren();
		Logger.consoleDebug('chidren count:' + children.length);
		for (var child = 0; child < children.length; child++){
			Logger.consoleDebug('children['+child+']:' + children[child]);
		}
	};


	function newTreeNode(name, path, id, isSelectable, isSelected){
		var treeNode = null;

		treeNode = new TreeNode(name, path, id, isSelectable, isSelected);
		Object.seal(treeNode);

		return treeNode;
	}

	function validate(treeNode){
		if (!Common.isSet(treeNode)){
			return false;
		}

		return true;
	}


	function testing(){
		var testNode = null;

		Logger.consoleDebug("Start TreeNode.testing()");

		var root = new TreeNode("name0", "path0", 0, true);

		for (var i = 1; i < 10; i++){
			testNode = new TreeNode("name" + i, "path" + i, i, true);

			for (var j = 0 ; j < 3; j++){
				i++;
				var node = new TreeNode("name" + i, "path" + i, i, true);
				testNode.addChild(node);
			}

			root.addChild(testNode);
		}

		root.debugPrint();
		console.log(root.getAllChildren());


		Logger.consoleDebug("Exit TreeNode.testing()");
	}


	exports.newTreeNode = newTreeNode;
	exports.validate    = validate;
	exports.testing     = testing;

});
