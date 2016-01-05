/*
 * Define the esp language code mirror.
 */
define(function (require, exports) {
	"use strict";

	var CodeMirror = brackets.getModule('thirdparty/CodeMirror/lib/codemirror');

	function Provider() {
		this.hints = CodeMirror.hintWords.esp;
		this.prevHint = [];
		this.search = "";
		this.isStartingNewHint = true;

		this.hasHints = function (editor, implicitChar) {			
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
			if (this.search.length == 0) {
				this.startNewHint();
				newHintArray = [];
			} else {
				newHintArray = this.getHintArray();
				
				//Only adjust the hint array when the length of the array
				//returned is >= 1. This prevents us from exiting the hinting
				//function when an invalid input is entered.
				if(newHintArray.length >= 1){
					this.prevHint = newHintArray;
				} 
				//Disable selecting the initial result as no matches were found
				else {
					selectInitial = false;
				}
			}
			
			console.log(newHintArray);

			//Return the requested object
			return {
				hints: this.prevHint,
				search: this.search,
				selectInitial: selectInitial,
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
		
		//Starts a new word when called without parameters
		//when called with a parameter then it depends
		this.startNewHint = function(implicitChar){
			var shouldStartNewHint = true;
			
			if(typeof implicitChar !== 'undefined'){
				shouldStartNewHint = implicitChar == '\r' ||
				implicitChar == '' ||
				implicitChar == ' ' ||
				implicitChar == '\f' ||
				implicitChar == '\n';
			}
			
			if(shouldStartNewHint){
				this.search = "";
				this.isStartingNewHint = true;
				this.prevHint = [];
			}
			
			return shouldStartNewHint;
		}
	}

	exports.Provider = Provider;
});