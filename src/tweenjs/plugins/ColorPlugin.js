/*
* ColorPlugin
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
	 * The ColorPlugin enables tweening of almost any CSS color values. This includes 3 or 6 digit hex colors (`#00FF00`),
	 * rgb, rgba, hsl, and hsla colors (but not named colors, such as `red`).
	 * 
	 * It can operate in either `rgb` or `hsl` mode. It will convert all colors into that mode, and output them accordingly.
	 * @class ColorPlugin
	 * @constructor
	 */
	function ColorPlugin() {
		throw("ColorPlugin cannot be instantiated.");
	}
	var s = ColorPlugin;
	
	
	/**
	 * READ-ONLY. RegExp pattern that detects CSS color values.
	 * @property COLOR_RE
	 * @type {RegExp}
	 * @static
	 * @readonly
	 */
	s.COLOR_RE = /^#[0-9a-fA-F]{3}|^hsla?\(|^rgba?\(/
	
	/**
	 * READ-ONLY. RegExp pattern that matches rgb or hsl color strings, with groups for each value.
	 * @property RGB_HSL_RE
	 * @type {RegExp}
	 * @static
	 * @readonly
	 */
	s.RGB_HSL_RE = /^(?:rgb|hsl)a?\((\d{1,3})%?, ?(\d{1,3})%?, ?(\d{1,3})%?(?:, ?([0-9.]+))?\)$/;
	
	/**
	 * READ-ONLY. RegExp pattern that matches a 3 or 6 digit RGB string with a preceding #.
	 * @property HEX_RE
	 * @type {RegExp}
	 * @static
	 * @readonly
	 */
	s.HEX_RE = /^#((?:[a-f0-9]{3}){1,2})$/i;

	/**
	 * @property _mode
	 * @type {string}
	 * @static
	 * @default rgb
	 * @protected
	 */
	s._mode = "rgb";
	
	/**
	 * READ-ONLY. A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
	 * @property ID
	 * @type {String}
	 * @static
	 * @readonly
	 **/
	s.ID = "Color";

	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @param {String} mode A string equalling either "rgb" or "hsl" indicating what color mode should be used for calculations
	 * and output. You can input any color type regardless of the mode setting.
	 * @static
	 **/
	s.install = function(mode) {
		s._mode = mode || s._mode;
		createjs.Tween._installPlugin(s);
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
		value = value === undefined ? tween.target[prop] : value;
		if (!data.Color_disabled && typeof value === "string" && s.COLOR_RE.exec(value)) {
			tween._addPlugin(s);
			var colorData = data.Color || (data.Color = {});
			colorData[prop] = true;
			return getColorObj(value, s._mode);
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
	s.step = function(tween, step, props) {
		var n, colorData = tween.pluginData.Color;
		for (n in props) {
			if (!colorData[n]) { continue; }
			step.props[n] = getColorObj(step.props[n], s._mode);
		}
	};

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
		if (!tween.pluginData.Color[prop]) { return; }
		var o0=step.prev.props[prop], o1 = step.props[prop];
		
		var d0 = o1[0]-o0[0], v1=o0[1]+(o1[1]-o0[1])*ratio+0.5|0, v2=o0[2]+(o1[2]-o0[2])*ratio+0.5|0, a=(o0[3]+(o1[3]-o0[3])*ratio).toFixed(3);
		if (s._mode === "rgb") {
			return "rgba("+(o0[0]+d0*ratio+0.5|0)+", "+v1+", "+v2+", "+a+")";
		} else {
			if (d0 > 180) { d0 -= 360; }
			else if (d0 < -180) { d0 += 360; }
			return "hsla("+((o0[0]+d0*ratio+360)%360+0.5|0)+", "+v1+"%, "+v2+"%, "+a+")";
		}
	};
	
	
// private helper methods:
	function getColorObj(value, mode) {
		if (value[0] === "#") { return parseHex(value, mode); }
		else { return parseRgbOrHsl(value, mode); }
	}
	
	function parseRgbOrHsl(value, mode) {
		var o=[0,0,0,1], result = s.RGB_HSL_RE.exec(value);
		if (!result) { return o;}
		
		var rgb = value[0] === "r", m = (rgb && value.lastIndexOf("%") !== -1) ? 255/100 : 1;
		o[0] = parseInt(result[1]) * m;
		o[1] = parseInt(result[2]) * m;
		o[2] = parseInt(result[3]) * m;
		o[3] = result[4] === undefined ? 1 : parseFloat(result[4]);
		
		if (!rgb && mode === "rgb") { hslToRgb(o); }
		else if (rgb && mode !== "rgb") { rgbToHsl(o); }
		return o;
	};
	
	function parseHex(value, mode) {
		var o=[0,0,0,1], result = s.HEX_RE.exec(value);
		if (!result) { return o;}
		var hex = result[1];
		if (hex.length === 3) { hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]; }
		
		var num = parseInt(hex, 16);
		o[0] = num>>16;
		o[1] = num>>8&0xFF;
		o[2] = num&0xFF;
		
		if (mode !== "rgb") { rgbToHsl(o); }
		
		return o;
	};
	
	function rgbToHsl(o) {
		var r=o[0], g=o[1], b=o[2], m = 1/255;
		r *= m, g *= m, b *= m;
		// TODO: Math.max/min are pretty slow vs conditional assignment
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) * 0.5;

		if (max === min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			if (max === r) { h = (g - b) / d + (g < b ? 6 : 0); }
			else if (max === g) { h = (b - r) / d + 2; }
			else { h = (r - g) / d + 4; }
			h /= 6;
		}
		o[0] = h*360;
		o[1] = s*100;
		o[2] = l*100;
	}

	function hslToRgb(o) {
		var h=(o[0]%360)/360, s=o[1]/100, l=o[2]/100;
		var r, g, b;
		if (s == 0) {
			r = g = b = l; // achromatic
		} else {
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}
		o[0] = r*255;
		o[1] = g*255;
		o[2] = b*255;
	}
	
	function hue2rgb(p, q, t) {
		if (t < 0) { t += 1; }
		else if (t > 1) { t -= 1; }
		
		if (t < 1 / 6) { return p + (q - p) * 6 * t; }
		if (t < 0.5) { return q; }
		if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
		return p;
	}

	createjs.ColorPlugin = s;
}());