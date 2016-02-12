define (function (require, exports){
	"use strict";

	var Common = require("src/Common"),
		Globals = require("src/Globals"),
		Logger  = require("src/Logger");

	function TreeNode(name, path, id, selectable){

		this.parent = null;
		this.name   = name;
		this.id     = id;
		this.path   = path;
		this.level  = 0;
		this.children = [];

		this.isSelectable = selectable;
		this.isSelected  = false;
	}


	/**
	 * Return root node of the current node.
	 **/

	TreeNode.prototype.getRootNode = function(){
		var rootNode = this;

		while (Common.isSet(rootNode.parent)){
			rootNode = rootNode.parent;
		}

		return rootNode;
	}


	TreeNode.prototype.debugPrint = function(){
		Logger.consoleDebug('parent:    ' + this.parent);
		Logger.consoleDebug('name:      ' + this.name);
		Logger.consoleDebug('id:        ' + this.id);
		Logger.consoleDebug('path:      ' + this.path);
		Logger.consoleDebug('level:     ' + this.level);
		Logger.consoleDebug('isSelectable:' + this.isSelectable);
		Logger.consoleDebug('isSeleted:   ' + this.isSelected);

		Logger.consoleDebug('chidren count:' + this.children.length);
		for (var child = 0; child < this.children.length; child++){
			Logger.consoleDebug('children['+child+']:' + this.children[child]);
		}
	};



});
