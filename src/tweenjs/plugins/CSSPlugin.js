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

/**
* @module TweenJS
*/

// namespace:
this.createjs = this.createjs||{};

(function() {
	"use strict";

	/**
	 * A TweenJS plugin for working with numeric CSS string properties (ex. top, left). To use simply install after
	 * TweenJS has loaded:
	 *
	 *      createjs.CSSPlugin.install();
	 *
	 * You can adjust the CSS properties it will work with by modifying the <code>cssSuffixMap</code> property. Currently,
	 * the top, left, bottom, right, width, height have a "px" suffix appended.
	 *
	 * Please note that the CSS Plugin is not included in the TweenJS minified file.
	 * @class CSSPlugin
	 * @constructor
	 **/
	function CSSPlugin() {
		throw("CSSPlugin cannot be instantiated.")
	}
// TODO: update docs.

// static properties
	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	CSSPlugin.priority = -100; // very low priority, should run last
	
	CSSPlugin.id = "CSS";
	CSSPlugin.re = /^(-?\d+(?:.\d+)?)([a-z%]*)$/m; // extracts the numeric value and suffix


// static methods
	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	CSSPlugin.install = function() {
		createjs.Tween._installPlugin(CSSPlugin);
	};

	/**
	 * @method init
	 * @protected
	 * @static
	 **/
	CSSPlugin.init = function(tween, prop, value) {
		var data = tween.pluginData;
		if (data.CSS_disabled || !(tween.target instanceof HTMLElement)) { return; }
		var style = tween.target.style, initVal = style[prop];
		if (initVal === undefined) { return;  }
		
		tween._addPlugin(CSSPlugin);
		
		// TODO: add special handlers for "transform" and the like.
		
		var result = CSSPlugin.re.exec(initVal), cssData = data.CSS || (data.CSS = {});
		if (result === null) {
			// a string we can't handle numerically, so add it to the CSSData without a suffix.
			cssData[prop] = "";
			return initVal;
		} else {
			cssData[prop] = result[2];
			return parseFloat(result[1]);
		}
	};

	/**
	 * @method step
	 * @protected
	 * @static
	 **/
	CSSPlugin.step = function(tween, step, props) { /* unused */ };

	/**
	 * @method change
	 * @protected
	 * @static
	 **/
	CSSPlugin.change = function(tween, step, prop, value, ratio, end) {
		var sfx = tween.pluginData.CSS[prop];
		if (sfx === undefined) { return; }
		tween.target.style[prop] = value+sfx;
		return createjs.Tween.IGNORE;
	};

	createjs.CSSPlugin = CSSPlugin;

}());
