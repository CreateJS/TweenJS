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

this.createjs = this.createjs||{};

(function() {
	"use strict";

	/**
	 * A TweenJS plugin for working with numeric CSS string properties (ex. top, left). To use simply install after
	 * TweenJS has loaded:
	 *
	 * 	createjs.CSSPlugin.install();
	 *
	 * CSSPlugin works with almost any style property or unit. It identifies CSS values by looking for an initial value
	 * on the element's `style` object. It also uses this initial value to parse out the units to use with that value.
	 * 
	 * In the following example, `top` would be tweened as a style using `em` units using CSSPlugin, but `width` 
	 * would be not be tweened as a style (because there is no initial inline style value for it).
	 *
	 * 	myEl.style.top = "10em";
	 * 	createjs.Tween.get(myEl).to({top:20, width:100}, 1000);
	 *
	 * CSSPlugin can also use computed styles. Please see {{#crossLink "AbstractTween/compute:property"}}{{/crossLink}}
	 * for more information.
	 * 
	 * Please note that the CSS Plugin is not included in the TweenJS minified file.
	 * @class CSSPlugin
	 * @constructor
	 **/
	function CSSPlugin() {
		throw("CSSPlugin cannot be instantiated.")
	}
	var s = CSSPlugin;

// static properties
	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	s.priority = -100; // very low priority, should run last
	
	/**
	 * READ-ONLY. A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
	 * @property ID
	 * @type {String}
	 * @static
	 * @readonly
	 **/
	s.ID = "CSS";
	
	/**
	 * READ-ONLY. RegExp pattern that matches a 3 or 6 digit RGB string with a preceding #.
	 * @property RE
	 * @type {RegExp}
	 * @static
	 * @readonly
	 */
	s.RE = /^(-?\d+(?:.\d+)?)([a-z%]*)$/m; // extracts the numeric value and suffix
	
	/**
	 * By default, CSSPlugin uses only inline styles on the target element (ie. set via the style attribute, `style` property, or `cssText`)
	 * to determine which properties should be tweened via CSS, and what units to use.
	 * 
	 * Setting `compute` to `true` causes CSSPlugin to use `getComputedStyle` for this purpose. This has the advantage of
	 * including all styles that effect the target element, however there are some important considerations for its use:<UL>
	 * 	<LI> `getComputedStyle` is computationally expensive, which could lead to performance issues if you are creating a large
	 * 	number of tweens at once.
	 * 	<LI> styles are normalized. For example, a width value specified as a `%` may be computed as `px`, which CSSPlugin will
	 * 	use for the tween. Different browsers _may_ normalize values differently.
	 * 	<LI> there are a large number of computed styles, which increases the chance that a property will be identified as a style.
	 * 	<LI> does not work with IE8 or below.
	 * 	</UL>
	 * 	
	 * 	The `compute` setting can be overridden on a per-tween basis by setting `tween.pluginData.CSS_compute`. For example,
	 * 	to enable computed styles for a new tween, you could use:
	 * 	
	 * 		createjs.Tween.get(el, {pluginData:{CSS_compute:true}}).to({top:20}, 1000);
	 * 	
	 * 	Given the considerations for `compute`, it is recommended that you keep the default global setting of `false` and override it
	 * 	in specific cases via `pluginData`.
	 * @property compute
	 * @type {Boolean}
	 * @default false
	 * @static
	 */
	s.compute = false;


// static methods
	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	s.install = function() {
		createjs.Tween._installPlugin(CSSPlugin);
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
		if (data.CSS_disabled || !(tween.target instanceof HTMLElement)) { return; }
		var initVal = s._getStyle(tween.target, prop, data.CSS_compute);
		if (initVal === undefined) { return;  }
		
		tween._addPlugin(CSSPlugin);
		
		// TODO: add special handlers for "transform" and the like.
		
		var result = s.RE.exec(initVal), cssData = data.CSS || (data.CSS = {});
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
	 * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
	 * See {{#crossLink "SamplePlugin/step"}}{{/crossLink}} for more info.
	 * @method step
	 * @param {Tween} tween
	 * @param {TweenStep} step
	 * @param {Object} props
	 * @static
	 **/
	s.step = function(tween, step, props) { /* unused */ }; // TODO: if we want this to work with ColorPlugin (and others) we need to write the style values back to the tween.

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
		var sfx = tween.pluginData.CSS[prop];
		if (sfx === undefined) { return; }
		tween.target.style[prop] = value+sfx;
		return createjs.Tween.IGNORE;
	};
	
	s._getStyle = function(target, prop, compute) {
		if (compute || (compute == null && s.compute)) {
			return window.getComputedStyle(target)[prop];
		} else {
			return target.style[prop];
		}
	};

	createjs.CSSPlugin = s;

}());
