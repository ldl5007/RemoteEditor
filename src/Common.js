define(function (require, exports) {
	"use strict";

	/**
	 * Check if a variable is undefined or null
	 *
	 * @param   {*}  variable The variable to check
	 *
	 * @returns {Boolean} true if the element is defined and not null
	 *                    false if the element is undefined or null
	 */
	function isSet(variable) {
		if (typeof variable == "undefined") {
			return false;
		} else if (variable === null) {
			return false;
		} else if (typeof variable === "string") {
			return variable !== "";
		} else if (typeof variable === "number") {
			return variable !== 0;
		} else if (typeof variable === "object") {
			//Split arrays and objects
			if (typeof variable.length === "undefined") {
				//We are now dealing with an object
				var foundData = false;
				for (var x in variable) {
					if (typeof variable[x] !== "undefined" && variable[x] !== null) {
						foundData = true;
						break;
					}
				}
				return foundData;
			} else {
				//We are now processing an array
				if (variable.length >= 1) return true;
				else return false;
			}
		}

		return true;
	}


	exports.isSet = isSet;
});
