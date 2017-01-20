/*
* CSSPlugin
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

import Tween from "../Tween";

/**
 * A TweenJS plugin for working with numeric CSS string properties (ex. top, left). To use simply install after
 * TweenJS has loaded:
 *
 *     createjs.CSSPlugin.install();
 *
 * You can adjust the CSS properties it will work with by modifying the <code>cssSuffixMap</code> property. Currently,
 * the top, left, bottom, right, width, height have a "px" suffix appended.
 *
 * Please note that the CSS Plugin is not included in the TweenJS minified file.
 * @class CSSPlugin
 * @module TweenJS
 * @static
 */
export default class CSSPlugin {

// constructor:
	/**
	 * @constructor
	 */
	constructor () {
		throw "CSSPlugin is static and cannot be instanitated.";
	}

// static methods
	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 */
	static install () {
		Tween._installPlugin(CSSPlugin);
	}

	/**
	 * Called by TweenJS when a new property initializes on a tween.
   * See {{#crossLink "SamplePlugin/init"}}{{/crossLink}} for more info.
   * @method init
   * @param {Tween} tween
   * @param {String} prop
   * @param {any} value
   * @return {any}
   * @static
	 */
	static init (tween, prop, value) {
		let data = tween.pluginData;
		if (data.CSS_disabled || !(tween.target instanceof HTMLElement)) { return; }
		let style = tween.target.style, initVal = style[prop];
		if (initVal === undefined) { return;  }

		tween._addPlugin(CSSPlugin);

		// TODO: add special handlers for "transform" and the like.

		let result = CSSPlugin.RE.exec(initVal), cssData = data.CSS || (data.CSS = {});
		if (result === null) {
			// a string we can't handle numerically, so add it to the CSSData without a suffix.
			cssData[prop] = "";
			return initVal;
		} else {
			cssData[prop] = result[2];
			return parseFloat(result[1]);
		}
	}

	/**
   * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
   * See {{#crossLink "SamplePlugin/step"}}{{/crossLink}} for more info.
   * @method step
   * @param {Tween} tween
   * @param {TweenStep} step
   * @param {Object} props
	 * @static
	 */
	static step (tween, step, props) {
		// unused
	}

	/**
   * Called before a property is updated by the tween.
   * See {{#crossLink "SamplePlugin/change"}}{{/crossLink}} for more info.
   * @method change
   * @param {Tween} tween
   * @param {TweenStep} step
   * @param {String} prop
   * @param {any} value
   * @param {Number} ratio
   * @param {Boolean} end
   * @return {any}
	 * @static
	 */
	static change (tween, step, prop, value, ratio, end) {
		let sfx = tween.pluginData.CSS[prop];
		if (sfx === undefined) { return; }
		tween.target.style[prop] = value + sfx;
		return Tween.IGNORE;
	}

}

// static properties
/**
 * @property priority
 * @protected
 * @static
 */
CSSPlugin.priority = -100; // very low priority, should run last

/**
 * A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
 * @property ID
 * @type {String}
 * @static
 * @readonly
 */
CSSPlugin.ID = "CSS";

/**
 * RegExp pattern that matches a 3 or 6 digit RGB string with a preceding #.
 * @property RE
 * @type {RegExp}
 * @static
 * @readonly
 */
CSSPlugin.RE = /^(-?\d+(?:.\d+)?)([a-z%]*)$/m; // extracts the numeric value and suffix
