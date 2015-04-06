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
	 * Defines the default suffix map for CSS tweens. This can be overridden on a per tween basis by specifying a
	 * cssSuffixMap value for the individual tween. The object maps CSS property names to the suffix to use when
	 * reading or setting those properties. For example a map in the form {top:"px"} specifies that when tweening
	 * the "top" CSS property, it should use the "px" suffix (ex. target.style.top = "20.5px"). This only applies
	 * to tweens with the "css" config property set to true.
	 * @property cssSuffixMap
	 * @type Object
	 * @static
	 **/
	CSSPlugin.cssSuffixMap = {top:"px",left:"px",bottom:"px",right:"px",width:"px",height:"px",opacity:""};

	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	CSSPlugin.priority = -100; // very low priority, should run last


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
		if (tween.pluginData.CSS_disable || !(tween.target instanceof HTMLElement)) { return; }
		
		var sfx0,sfx1,style,map = CSSPlugin.cssSuffixMap;
		if ((sfx0 = map[prop]) === undefined || !(style = tween.target.style)) { return value; }
		tween._addPlugin(CSSPlugin);
		var str = style[prop];
		if (!str) { return 0; } // no style set.
		var i = str.length-sfx0.length;
		if ((sfx1 = str.substr(i)) != sfx0) {
			throw("CSSPlugin Error: Suffixes do not match. ("+sfx0+":"+sfx1+")");
		} else {
			return parseInt(str);
		}
	};

	/**
	 * @method step
	 * @protected
	 * @static
	 **/
	CSSPlugin.step = function(tween, step, prop, value, injectProps) {
		// unused
	};

	/**
	 * @method tween
	 * @protected
	 * @static
	 **/
	CSSPlugin.tween = function(tween, step, prop, value, ratio, end) {
		var style,map = CSSPlugin.cssSuffixMap, sfx=map[prop];
		if (sfx === undefined || !(style = tween.target.style)) { return; }
		style[prop] = (value|0)+sfx;
		return createjs.Tween.IGNORE;
	};

	createjs.CSSPlugin = CSSPlugin;

}());
