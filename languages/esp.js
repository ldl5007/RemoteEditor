/*
 * Define the esp language code mirror.
 */
define(function (require, exports) {
	"use strict";

	//I'm figuring this out as I go so the comments will become more indepth as time
	//goes on.

	//Load the required module
	var CodeMirror = brackets.getModule('thirdparty/CodeMirror/lib/codemirror');

	function keywords(string) {
		return string.split(' ');
	}

	//Define keywords as arrays
	var wordOperators = keywords("and not noshare on or share to");
	var controlOperators = keywords("assign call do else end exit gosub procedure otherwise retsub return select then when while");
	var builtins = keywords("a2e abs appc args b2c bitand bitor bitxor c2b c2d c2fp c2x control copies cos d2c d2x date delay e2a " +
		"forever fp2c fp2x insert int intcmd intread iterate leave left log log10 lower max min noyes nparse " +
		"null0 parse pause pos random remstr resume right seccall selstr sin socket space sqrt substr translate " +
		"typechk upper vartable word wordlength wordpos words write wto x2c x2d x2fp zfeature");

	//Register code helpers
	CodeMirror.registerHelper("hintWords", "esp", controlOperators.concat(builtins));

	function top(state) {
		return state.scopes[state.scopes.length - 1];
	}

	//This is the entire definition for the esp language. After defining it here, we are
	//able to add it through the LanguageManager in brackets
	CodeMirror.defineMode("esp", function (config, parserConfig) {


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
			/********* CHECK FOR BLOCK COMMENT ********/
			/******************************************/
			else if(char == "/"){
				if(stream.eat('*')){
					state.tokenize = tokenBlockComment;
					return state.tokenize(stream, state);
				}
				
				return "operator";
			} 
			/******************************************/
			/********* CHECK FOR LINE COMMENT *********/
			/******************************************/
			else if(char == '-'){
				if(stream.eat('*')){
					stream.skipToEnd();
					return "comment";
				}
				
				return "operator"
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
		function tokenBlockComment(stream, state){
			//Init variables
			var foundStar = false, char;
			
			while(char = stream.next()){
				//Conditions that need to be matched to
				//exit the comment
				if(foundStar && char == "/"){
					state.tokenize = tokenBase;
					break;
				}
				
				foundStar = (char == "*");
			}
			
			return "comment";
		}
		
		

		function tokenLexer(stream, state) {
			var style = state.tokenize(stream, state);
			var current = stream.current();


			if ((style == "variable" || style == "builtin") && state.lastToken == "meta")
				style = "meta";

			// Handle scope changes.
			/*if (current == "pass" || current == "return")
				state.dedent += 1;*/
			
			/*

			if (current == "lambda") state.lambda = true;
			if (current == ":" && !state.lambda && top(state).type == "py")
				pushScope(stream, state, "py");

			var delimiter_index = current.length == 1 ? "[({".indexOf(current) : -1;
			if (delimiter_index != -1)
				pushScope(stream, state, "])}".slice(delimiter_index, delimiter_index + 1));

			delimiter_index = "])}".indexOf(current);
			if (delimiter_index != -1) {
				if (top(state).type == current) state.scopes.pop();
				else return ERRORCLASS;
			}
			if (state.dedent > 0 && stream.eol() && top(state).type == "py") {
				if (state.scopes.length > 1) state.scopes.pop();
				state.dedent -= 1;
			}*/

			return style;
		}



		return {
			startState: function (basecolumn) {
				return {
					tokenize: tokenBase,
					scopes: [{
						offset: basecolumn || 0,
						type: "esp",
						align: null
					}],
					lastToken: null,
					lambda: false,
					dedent: 0
				};
			},

			token: function (stream, state) {
				var addErr = state.errorToken;
				if (addErr) state.errorToken = false;
				var style = tokenLexer(stream, state);

				if (style && style != "comment")
					state.lastToken = (style == "keyword" || style == "punctuation") ? stream.current() : style;
				
				if (style == "punctuation") style = null;

				/*if (stream.eol() && state.lambda)
					state.lambda = false;*/
				//return addErr ? style  : style;
				
				return style;
			},

			indent: function (state, textAfter) {
				/*if (state.tokenize != tokenBase)
					return state.tokenize.isString ? CodeMirror.Pass : 0;

				var scope = top(state);
				var closing = textAfter && textAfter.charAt(0) == scope.type;
				if (scope.align != null)
					return scope.align - (closing ? 1 : 0);
				else if (closing && state.scopes.length > 1)
					return state.scopes[state.scopes.length - 2].offset;
				else
					return scope.offset;*/
				
				return 0;
			},

			closeBrackets: "(){}''\"\"",
			blockCommentStart: "/*",
			blockCommentEnd: "*/",
			lineComment: "-*",
			fold: "indent"
		}
	});
});