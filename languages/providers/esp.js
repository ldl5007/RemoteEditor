/*
 * Define the esp language code mirror.
 */
define(function (require, exports) {
	"use strict";

	var CodeMirror = brackets.getModule('thirdparty/CodeMirror/lib/codemirror');

	function Provider() {
		this.hints = CodeMirror.hintWords.esp;
		this.search = "";
		this.startNewHint = true;

		this.hasHints = function (editor, implicitChar) {
			console.log('hasHints: ' + implicitChar);
			
			//Prevent hinting from starting on a new line or space
			//wait for the first character to start hinting
			if (implicitChar == "" || implicitChar == " ") {
				this.search = "";
				this.startNewHint = true;
				return false;
			} 
			//Only start hinting if we are ready,
			//keeps us from displaying hints for a word as soon
			//as we run out of hints once
			else {
				return true;
			}
		}


		this.getHints = function (implicitChar) {
			this.startNewHint = false;
			
			if (implicitChar == null) {
				this.search = this.search.substr(0, this.search.length - 1);
			} else {
				this.search += implicitChar.toLowerCase();
			}
			
			console.log('getHints: ' + implicitChar);
			

			var newHintArray = this.getHintArray();
			
			
			return {
				hints: newHintArray,
				search: this.search,
				selectInitial: true,
				handleWideResults: true
			}
		}

		this.insertHint = function (hint) {
			console.log(hint);
		}



		this.getHintArray = function () {
			var retArray = [];

			for (var i = 0; i < this.hints.length; i++) {
				var current = this.hints[i];

				if (current.search(this.search) != -1)
					retArray.push(current);
			}

			return retArray;
		}

		function getMatchPercentage() {

		}
	}

	exports.Provider = Provider;
});