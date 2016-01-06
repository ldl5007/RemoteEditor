//@TODO - Add better comments

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

			//Check to see if we can start a new hint
			if (this.isWordBreak(implicitChar)) {
				return false;
			} else {
				this.startNewHint();

				//Get the editor's cursor position and the line
				var pos = this.editor.getCursorPos();
				var startPos = pos.ch - 2,
					endPos = pos.ch - 2;
				var line = this.editor.document.getLine(pos.line);

				//Loop until we find a non word character
				while (line.charAt(startPos - 1).match(/[0-9A-Za-z\#\&\$]/) && startPos > 0) {
					startPos--;
				}

				//Adjust the search string
				this.search = line.substr(startPos, (endPos - startPos) + 1).toLowerCase();

				if (line.trim() == this.search && this.search == implicitChar) {
					this.search = "";
				}

				return true;
			}
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
					if (newHintArray.length == 1 && $(newHintArray[0]).children('.hint-text').eq(0).text() == this.search) {
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
			var start = {
				line: position.line,
				ch: position.ch - this.search.length
			}

			//Insert the hint by parsing the jQuery object
			this.editor.document.replaceRange($(hint).children('.hint-text').eq(0).text() + ' ', start, position);
			this.startNewHint();

			return false;
		}

		this.getHintArray = function () {
			var retArray = [],
				maybeExactMatch = false,
				matchIndex = 0;

			//Loop through each hint
			for (var x in this.hints) {
				var position = x.search(this.search);

				if (position != -1) {
					//Need two code threads to efficently
					//handle matches
					if (maybeExactMatch) {
						//If we have already found a match, only add this element if
						//the search string starts at the beginning of x
						//thus call and seccall will only match call
						//while call, call1, and call2 will all match call 
						if (position == 0) {
							//Push a new element
							retArray.push(this.generateHintElement(x));
						}
					} else {
						//Check for an exact match
						if (this.search == x) {
							maybeExactMatch = true;
						} else {
							//Otherwise we are still looking for a
							//match
							matchIndex++;
						}

						//Push a new element
						retArray.push(this.generateHintElement(x));
					}
				}
			}

			//Now we are going to do some smart things here and look
			//for stuff up to the return index.
			if (maybeExactMatch) {
				var i = 0;
				while (i < matchIndex) {
					text = $(retArray[i]).children('.hint-text').eq(0).text();

					//Check if the current hint starts explicitly with the
					//search string
					if (text.search(this.search) == 0) {
						i++;
					} else {
						//Remove the current element from the array as it does not
						//start with the search string. And we have already found an exact match
						retArray.splice(i, 1);
						matchIndex--;
					}

				}
			}



			return retArray;
		}

		this.generateHintElement = function (text) {
			return '<span class="brackets-esp-hints ' + this.hints[text].class + '"><span class="hint-text">' + text + '</span></span>';
		}


		//Starts a new word when called without parameters
		//when called with a parameter then it depends
		this.startNewHint = function () {
			this.search = "";
			this.isStartingNewHint = true;
			this.prevHint = [];
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