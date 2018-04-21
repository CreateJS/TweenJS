/*
* DotPlugin
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
	 * The RelativePlugin for TweenJS enables tweening nested properties using dot syntax. Install using:
	 * 
	 * 	RotationPlugin.install();
	 * 
	 * To use the plugin, begin property names with `.`, such as:
	 * 
	 * 	createjs.Tween.get(targ).to({".position.x":20})
	 * 
	 * You can access array indexes with the same dot syntax:
	 * 
	 * 	// this would tween: foo.points[1].y
	 * 	createjs.Tween.get(foo).to({".points.1.y":30})
	 * 
	 * @class DotPlugin
	 * @constructor
	 **/
	function DotPlugin() {
		throw("DotPlugin cannot be instantiated.");
	};
	var s = DotPlugin;

// static interface:
	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	s.priority = 100; // high priority, should read first and write last
	
	/**
	 * READ-ONLY. A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
	 * @property ID
	 * @type {String}
	 * @static
	 * @readonly
	 **/
	s.ID = "Dot";

	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	s.install = function() {
		createjs.Tween._installPlugin(DotPlugin);
	};

	/**
	 * Called by TweenJS when a new property initializes on a tween.
	 * See {{#crossLink "SamplePlugin/init"}}{{/crossLink}} for more info.
	 * @method init
	 * @param {Tween} tween
	 * @param {String} prop
	 * @param {any} value
	 * @return {any}
	 * @static
	 **/
	s.init = function(tween, prop, value) {
		var data = tween.pluginData;
		if (data.Dot_disabled) { return; }
		
		// only operate on props starting with ".":
		if (prop[0] !== ".") { return; }
		tween._addPlugin(DotPlugin);
		
		var t = tween.target, arr=prop.split(".");
		for (var i=1, l=arr.length; i<l-1; i++) {
			if (!(t = t[arr[i]])) { return createjs.Tween.IGNORE; }
		}
		var n = arr[i], targetVal = t[n];
		var defaultVal = (value === undefined) ? targetVal : value;
		
		data.Dot = data.Dot || {};
		data.Dot[prop] = {t:t, n:n};

		return defaultVal;
	};

	/**
	 * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
	 * See {{#crossLink "SamplePlugin/step"}}{{/crossLink}} for more info.
	 * @method step
	 * @param {Tween} tween
	 * @param {TweenStep} step
	 * @param {Object} props
	 * @static
	 **/
	s.step = function(tween, step, props) {};

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
	 **/
	s.change = function(tween, step, prop, value, ratio, end) {
		var data = tween.pluginData.Dot, o;
		if (!data || !(o=data[prop])) { return; }
		
		o.t[o.n] = value;
		
		return createjs.Tween.IGNORE;
	};


	createjs.DotPlugin = s;
}());
