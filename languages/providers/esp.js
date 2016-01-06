/*
 * Define the esp language code mirror.
 */
define(function (require, exports, module) {
	"use strict";

	var CodeMirror = brackets.getModule('thirdparty/CodeMirror/lib/codemirror');
	var ExtensionUtils = brackets.getModule('utils/ExtensionUtils');
	
	//Load all stylesheets for the hints
	ExtensionUtils.loadStyleSheet(module, 'hints.less');
	
	
	function Provider() {
		this.hints = CodeMirror.hintWords.esp;
		this.prevHint = [];
		this.search = "";
		this.isStartingNewHint = true;
		this.editor = {};
		this.insertHintOnTab = true;

		this.hasHints = function (editor, implicitChar) {
			this.editor = editor;
	
			return !this.startNewHint(implicitChar);
		}

		this.getHints = function (implicitChar) {
			//Hoist variables	
			var newHintArray = [],
				selectInitial = true;

			this.isStartingNewHint = false;

			//Modify the search string
			if (implicitChar == null) {
				this.search = this.search.substr(0, this.search.length - 1);
			} else {
				this.search += implicitChar.toLowerCase();
			}

			//Check if the length is 0 if so
			//then exit hinting on this run through
			if (this.search.length == 0 || this.isWordBreak(implicitChar)) {
				this.startNewHint();
				newHintArray = [];
			} else {
				newHintArray = this.getHintArray();

				//Only adjust the hint array when the length of the array
				//returned is >= 1. This prevents us from exiting the hinting
				//function when an invalid input is entered.
				if (newHintArray.length >= 1) {
					if(newHintArray.length == 1 && $(newHintArray[0]).children('.hint-text').eq(0).text() == this.search){
						newHintArray = [];
					}
					
					this.prevHint = newHintArray;
				}
				//Disable selecting the initial result as no matches were found
				else {
					selectInitial = false;
				}
			}

			//Return the requested object
			return {
				hints: this.prevHint,
				search: this.search,
				selectInitial: selectInitial,
				handleWideResults: true
			}
		}

		this.insertHint = function (hint) {
			var position = this.editor.getCursorPos();
			var start = {line: position.line, ch: position.ch - this.search.length}
			
			//Insert the hint by parsing the jQuery object
			this.editor.document.replaceRange($(hint).children('.hint-text').eq(0).text() + ' ', start, position);
			this.startNewHint();
			
			return false;
		}

		this.getHintArray = function () {
			var retArray = [];
			
			for (var x in this.hints){
				if (x.search(this.search) != -1){
					//Push the style of the class
					retArray.push('<span class="brackets-esp-hints ' + this.hints[x].class + '"><span class="hint-text">' + x + '</span></span>');
				}
			}
				
			

			return retArray;
		}

		//Starts a new word when called without parameters
		//when called with a parameter then it depends
		this.startNewHint = function (implicitChar) {
			var shouldStartNewHint = true;

			if (typeof implicitChar !== 'undefined') {
				shouldStartNewHint = this.isWordBreak(implicitChar);
			}

			if (shouldStartNewHint) {
				this.search = "";
				this.isStartingNewHint = true;
				this.prevHint = [];
			}

			return shouldStartNewHint;
		}

		this.isWordBreak = function (char) {
			return char == '\r' ||
				char == '' ||
				char == ' ' ||
				char == '\f' ||
				char == '\n';
		}
	}

	exports.Provider = Provider;
});