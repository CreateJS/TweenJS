/*
* ColorPlugin
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2012 Mihhail Lapushkin
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

// namespace:
this.createjs = this.createjs||{};

(function() {
	// error messages
	var CANNOT_INSTANTIATE = 'ColorPlugin cannot be instantiated.';
	var NOT_VALID_TARGET = 'Object does not support color tweens or has no explicitly defined color.';
	var UNK_COLOR_FORMAT = 'Object has an unknown color format: {0}';
	var WRONG_PROPERTY = '{0} property expected, got: {1}';
	
	// private properties and methods
	var RGB = 'rgb';
	var HSL = 'hsl';
	var HEX_DIGITS = '0123456789ABCDEF';
	var COLOR_PARAM_INDEX = 1;
	
	var _int = parseInt;
	var _g = createjs.Graphics;
	var propIndexMap = {};
	
	for (var i = 0, formats = [ RGB, HSL ]; i < formats.length; i++) {
		var format = formats[i];
		propIndexMap[format] = {};
		
		for (var j = 0, colors = format.split(''); j < colors.length; j++) {
			propIndexMap[format][colors[j]] = j;
		}
	}
	
	// error handling
	function throwErr() {
		throw(formatStr.apply(arguments[0], Array.prototype.splice.call(arguments, 1)));
	}
	function formatStr() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
		    return typeof args[number] !== 'undefined' ? args[number] : match;
		});
	}
	function checkProperty(prop, format) {
		if (propIndexMap[format][prop] == null) throwErr(WRONG_PROPERTY, format.toUpperCase(), prop.toUpperCase());
	}
	function isValidTarget(t) {
		return t.graphics && t.graphics._fillInstructions && typeof getColor(t) === 'string';
	}
	
	// get/set color
	function getGraphicsColorCmdParams(t) {
		return t.graphics._fillInstructions[0].params;
	}
	function getColor(t) {
		return getGraphicsColorCmdParams(t)[COLOR_PARAM_INDEX] || t.color;
	}
	function setColor(t, v) {
		if (t.color) {
			t.color = v;
		} else {
			getGraphicsColorCmdParams(t)[COLOR_PARAM_INDEX] = v;
		}
	}
	
	// string to numbers
	function parseDecColor(c) {
		return c.substring(c.indexOf('(') + 1, c.length - 1).replace(/(%| )/g,'').split(',');
	}
	function parseHexColor(c) {
		return [ hexToDec(c.substring(1,3)), hexToDec(c.substring(3,5)), hexToDec(c.substring(5,7)) ];
	}
	
	// numbers to string
	function toHexStr(r, g, b) {
		return '#' + decToHex(r) + decToHex(g) + decToHex(b);
	}
	function toRGBStr(r, g, b, a) {
		return _g.getRGB(_int(r), _int(g), _int(b), a);
	}
	function toHSLStr(h, s, l, a) {
		return _g.getHSL(_int(h), s, l, a);
	}
	
	// hex conversions
	function isHex(c) {
		return c.charAt(0) === '#' && c.length === 7;
	}
	function hexToDec(h) {
		return _int(h, 16);
	}
	function decToHex(d) {
		return HEX_DIGITS.charAt((d - d % 16) / 16) + HEX_DIGITS.charAt(d % 16);
	}
	
	// static interface
	/**
	 * A TweenJS plugin for color tweening.
	 * Can be used to tween colors in any format: RGB, HSL or Hex.
	 * To use simply call ColorPlugin.install() after TweenJS has loaded.
	 * @class ColorPlugin
	 * @constructor
	 **/
	function ColorPlugin() {
		throwErr(CANNOT_INSTANTIATE);
	}
	
	/**
	 * Used by TweenJS to determine when to call this plugin.
	 * @property priority
	 * @protected
	 * @static
	 **/
	ColorPlugin.priority = -10;

	/**
	 * Installs this plugin for use with TweenJS. Call this once, after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	ColorPlugin.install = function() {
		var arr = [];
		
		for (var m in propIndexMap) {
			for (var p in propIndexMap[m]) { arr.push(p); }
		}

		createjs.Tween.installPlugin(ColorPlugin, arr);
	}
	
	/**
	 * Called by TweenJS when a new tween property initializes that this plugin is registered for.
	 * @method init
	 * @protected
	 * @static
	 **/
	ColorPlugin.init = function(tween, prop, value) {
		var t = tween._target;
		
		if (!isValidTarget(t)) throwErr(NOT_VALID_TARGET);
		
		var c = getColor(t);
		var arr;
		var format;
		
		if (isHex(c)) {
			format = RGB;
			
			checkProperty(prop, format);
			arr = parseHexColor(c);
		} else {
			format = c.substring(0,3);
			
			switch (format) {
				case RGB:
				case HSL:
					checkProperty(prop, format);
					arr = parseDecColor(c);
					break;
				default:
					throwErr(UNK_COLOR_FORMAT, c);
			}
		}
		
		return _int(arr[propIndexMap[format][prop]]);
	}
	
	/**
	 * Called by TweenJS when a tween property advances that this plugin is registered for.
	 * @method tween
	 * @protected
	 * @static
	 **/
	ColorPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, position, end) {
		var t = tween._target;
		
		var c = getColor(t);
		var arr;
		var format;
		var toStrFunc;
		
		if (isHex(c)) {
			format = RGB;
			
			arr = parseHexColor(c);
			toStrFunc = toHexStr;
		} else {
			format = c.substring(0,3);
			
			arr = parseDecColor(c);
			toStrFunc = format === RGB ? toRGBStr : toHSLStr;
		}
		
		arr[propIndexMap[format][prop]] = value;
		
		setColor(t, toStrFunc.apply(null, arr));
		
		return value;
	}
	
createjs.ColorPlugin = ColorPlugin;
}());