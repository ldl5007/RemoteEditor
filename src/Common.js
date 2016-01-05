define(function (require, exports) {
	"use strict";

	/**
	 * Check if a variable is undefined, null, or empty
	 * 
	 * @param   {*}  variable The variable to check
	 *                             
	 * @returns {Boolean} true if the element is empty
	 *                    false if the element is empty
	 */
	function isEmpty(variable) {
		if (!isSet(variable)) {
			return true;
		} else if (typeof variable === "string") {
			return variable == "";
		} else if (typeof variable === "number") {
			return variable == 0;
		} else if (typeof variable === "object") {
			//Split arrays and objects
			if (typeof variable.length === "undefined") {
				//We are now dealing with an object
				var foundData = false;
				for (var x in variable) {
					if (typeof variable[x] !== "undefined" && variable[x] != null) {
						foundData = true;
						break;
					}
				}
				return !foundData;
			} else {
				//We are now processing an array
				if (variable.length >= 1) return false;
				else return true;
			}
		}

		return false;
	}

	/**
	 * Check if a variable is undefined, null
	 * 
	 * @param   {*}  variable The variable to check
	 *                             
	 * @returns {Boolean} true if the element is defined and not null
	 *                    false if the element is undefined or null
	 */
	function isSet(variable) {
		if (typeof variable == "undefined" || variable == null)
			return false;
		else
			return true;
	}


	exports.isEmpty = isEmpty;
	exports.isSet = isSet;
});