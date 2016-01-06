/*
 * Define the esp language code mirror.
 */
define(function (require, exports) {
	"use strict";

	//I'm figuring this out as I go so the comments will become more indepth as time
	//goes on.

	//Load the required module
	var CodeMirror = brackets.getModule('thirdparty/CodeMirror/lib/codemirror');
	var CodeHintManager = brackets.getModule('editor/CodeHintManager');
	var ESPProvider = require('languages/providers/esp');

	/**
	 * Generate an array of keywords 
	 * @param {string} string A space separated list of keywords
	 * @returns {array}  An array that represents the string passed
	 */
	function keywords(string) {
		return string.split(' ');
	}

	/**
	 * This function will generate a keyword object based on
	 * multiple keyword arrays.
	 * @param {array}    styles The styles for the specific keywords
	 * @param {...array} array  One or more arrays to combine. The styles
	 *                          array must have a length equal to the number
	 *                          of elements passed
	 * @returns {object}   An object that represents all of the arrays passed
	 */
	function addKeywords(styles, array) {
		var object = {};

		//Loop through each array passed
		for (var arg = 1; arg < arguments.length; arg++) {
			//Get the array from the arguments
			var array = arguments[arg];

			//Loop through each element in the array
			for (var i = 0; i < array.length; i++) {
				object[array[i]] = styles[arg - 1];
			}
		}

		return object;
	}

	/**
	 * Adds a keyword array to the hint object to allow for colored
	 * results
	 * 
	 * @param {object} object    The object to to add the array elements to
	 * @param {array}  array     The array to parse
	 * @param {string} htmlClass The class that will be applied in the selection box
	 */
	function addHintArray(object, array, htmlClass) {
		for (var i = 0; i < array.length; i++) {
			object[array[i]] = {
				class: htmlClass
			}
		}
	}

	//Define keywords as arrays
	var wordOperators = keywords("and not noshare on or share to");
	var controlOperators = keywords("assign call do else end exit gosub if procedure otherwise retsub return select then when while");
	var builtins = keywords("a2e abs appc args b2c bitand bitor bitxor c2b c2d c2fp c2x control copies cos d2c d2x date delay delword e2a escapestr " +
		"forever format fp2c fp2x insert int intcmd intread iterate leave left length log log10 lower max min noyes nparse " +
		"null0 parse pause pos random remstr resume right seccall selstr sin socket space sqrt substr translate " +
		"typechk upper vartable vconcat word wordlength wordpos words write wto x2c x2d x2fp zfeature");

	//Generate the keywords object
	var espKeywords = addKeywords(["keyword", "keyword", "builtin"], wordOperators, controlOperators, builtins);
	var hints = {};

	addHintArray(hints, controlOperators, "control");
	addHintArray(hints, builtins, "builtin");

	//Register code helpers
	CodeMirror.registerHelper("hintWords", "esp", hints);

	//CodeMirror.hintWords.esp.sort();

	CodeHintManager.registerHintProvider(new ESPProvider.Provider(), ["esp"]);

	//This is the entire definition for the esp language. After defining it here, we are
	//able to add it through the LanguageManager in brackets
	CodeMirror.defineMode("esp", function (conf, parserConf) {
		function top(state) {
			return state.scopes[state.scopes.length - 1];
		}

		var wordRE = parserConf.wordCharacters || /[\w$#\xa1-\uffff]/;
		var number = /[0-9]/;
		var isOperator = /[+\-*\/%=\\<>|]/;

		var hangingIndent = parserConf.hangingIndent || conf.indentUnit;

		//comment
		function tokenBase(stream, state) {
			var char = stream.next();

			/******************************************/
			/********* CHECK FOR STRING ***************/
			/******************************************/
			if (char == '"' || char == "'") {
				state.tokenize = tokenString(char);
				return state.tokenize(stream, state);
			}
			/******************************************/
			/********* CHECK FOR OPERATORS ************/
			/******************************************/
			else if (isOperator.test(char)) {
				//check for comments
				if ((char == '-' || char == '/') && stream.eat('*')) {
					/******************************************/
					/********* CHECK FOR BLOCK COMMENT ********/
					/******************************************/
					if (char == '/') {
						state.tokenize = tokenBlockComment;
						return state.tokenize(stream, state);
					}
					/******************************************/
					/********* CHECK FOR LINE COMMENT *********/
					/******************************************/
					else {
						stream.skipToEnd();
						return "comment";
					}
				}
				//Parse as an operator
				else {
					//Eat all the operator characters
					stream.eatWhile(isOperator);
					return "operator";
				}
			}
			//VARIABLES
			else if (char == '&') {
				stream.eatWhile(wordRE);

				//Keep track if this is a variable or a stem
				if (state.lastState == "variable" || state.lastState == "property") {
					if (state.lastToken == '.') {
						return "property";
					} else {
						return "variable";
					}
				}

				return "variable";
			}
			/******************************************/
			/********* CHECK FOR NUMBERS **************/
			/******************************************/
			else if (char == '.') {
				//Handle variables with . in them
				if (state.lastState == "variable" || state.lastState == "property") {
					return "operator";
				} else {
					//Eat all of the numbers
					if (stream.eat(number)) {
						stream.eatWhile(number);
						
						return "number";
					} else{
						return "operator";
					}
				}
			} else if (number.test(char)) {
				stream.eatWhile(number);
				
				return "number";
			}
			/******************************************/
			/********* CHECK FOR KEYWORDS *************/
			/******************************************/
			else if (wordRE.test(char)) {
				stream.eatWhile(wordRE);
				var word = stream.current().toLowerCase(),
					known = espKeywords.propertyIsEnumerable(word) && espKeywords[word];
				
				if(known && state.lastToken != "."){
					return known;
				} 
				else{
					return "property";
				}
			}
		}

		/**
		 * This function will generate a function to parse through a
		 * string based on the entry character
		 * 
		 * @param   {string}   quote The string entry character
		 * @returns {function} The parsing function that should be called
		 */
		function tokenString(quote) {
			return function (stream, state) {
				//Init variables
				var escaped = false,
					next;

				//Loop through each character until we find the end
				//of the string
				while ((next = stream.next()) != null) {
					//Break if the starting quote was found
					//and the previous character wasn't an
					//escape character.
					if (next == quote && !escaped) break;

					//Found a \ so escape the string
					escaped = !escaped && next == "\\";
				}

				if (!escaped) state.tokenize = tokenBase;

				//Return that this is a string
				return "string";
			}
		}

		/**
		 * This function will tokenize a block comment
		 * @param   {object} stream The current stream
		 * @param   {object} state  The current state
		 * @returns {string} The style to report back to the caller
		 */
		function tokenBlockComment(stream, state) {
			//Init variables
			var foundStar = false,
				char;

			while (char = stream.next()) {
				//Conditions that need to be matched to
				//exit the comment
				if (foundStar && char == "/") {
					state.tokenize = tokenBase;
					break;
				}

				foundStar = (char == "*");
			}

			return "comment";
		}

		//This pushes an indent line
		function pushScope(stream, state, type) {
			var offset = 0;

			//Clear out hanging indentes
			if (type == "esp") {
				while (top(state).type != "esp")
					state.scopes.pop();
			}

			//Adjust the offset
			offset = top(state).offset + (type == "esp" ? conf.indentUnit : hangingIndent);

			//Push the scope
			state.scopes.push({
				offset: offset,
				type: type
			});
		}

		//Pop a scope from the state
		//returns true if we popped a scope
		//false if no scope was popped
		function popScope(state) {
			if (state.scopes.length > 1) {
				state.scopes.pop();
				return true;
			} else {
				return false;
			}
		}

		function tokenLexer(stream, state) {
			var style = state.tokenize(stream, state);
			var current = stream.current().toLowerCase();


			//Pop out of the continued statement
			if (top(state).type == "comma" && stream.eol()) {
				popScope(state);
			}

			//Check if there was possibly a continuation comma
			if (state.maybeComma && (style == "comment" || current.trim().length == 0)) {
				if (stream.eol()) {
					pushScope(stream, state, "comma");
				}
			} else {
				state.maybeComma = false;
			}

			//Pop out of the then clause scope
			if (top(state).type == "then" && stream.eol() && current != ",") {
				popScope(state);
			}

			//Handle indenting scopes
			//pushing a scope will increase the indent
			//popping a scope will decrease the indent			
			if (current == "do" || current == "procedure") {
				pushScope(stream, state, "esp");
			} else if (current == "then") {
				if (stream.eol()) {
					pushScope(stream, state, "then");
				}
			} else if (current == ",") {
				state.maybeComma = true;

				if (stream.eol()) {
					pushScope(stream, state, "comma")
				}
			}
			//Check to see if current is equal to "end" and then
			//attempt to popScope. If popScope fails then there
			//is an element in error
			else if (current == "end" && !popScope(state)) {
				return "error";
			}

			return style;
		}



		return {
			startState: function (basecolumn) {
				return {
					tokenize: tokenBase,
					scopes: [{
						offset: basecolumn || 0,
						type: "esp"
					}],
					lastToken: null,
					lastState: null,

					/**
					 *	Keep track of possible ending commas
					 */
					maybeComma: false
				};
			},

			token: function (stream, state) {
				var addErr = state.errorToken;
				if (addErr) state.errorToken = false;

				var style = tokenLexer(stream, state);
				var token = stream.current();

				if (token) {
					state.lastToken = token;
				}

				if (style) {
					state.lastState = style;
				}

				return style;
			},

			indent: function (state, textAfter) {
				if (state.tokenize != tokenBase)
					return state.tokenize.isString ? CodeMirror.Pass : 0;

				var scope = top(state);
				var closing = ((textAfter && textAfter == "end") || state.lastToken == "end");

				if (closing && state.scopes.length > 1)
					return state.scopes[state.scopes.length - 2].offset;
				else
					return scope.offset;

			},
			electricInput: /(end)/,
			closeBrackets: "(){}''\"\"",
			blockCommentStart: "/*",
			blockCommentEnd: "*/",
			lineComment: "-*",
			fold: "indent"
		}
	});
});