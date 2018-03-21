// run the master setup file first
require("@createjs/build/tests/setup");

const { resolve } = require("path");

module.exports = {
	rootPath: resolve(__dirname, "../") + "\\",

	getFilePath (fileObj) {
		return `${this.rootPath}assets/${typeof fileObj === "string" ? fileObj : fileObj.src}`;
	},

	findClass (selector) {
		// search backwards because the last match is more likely the right one
		for (let i = document.styleSheets.length - 1; i >= 0; i--) {
			let cssRules = document.styleSheets[i].cssRules || document.styleSheets[i].rules || []; // IE support
			for (let c = 0; c < cssRules.length; c++) {
				if (cssRules[c].selectorText === selector) {
					return true;
				}
			}
		}
		return false;
	}

};
