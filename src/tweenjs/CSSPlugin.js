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

if(!this.createjs)
	createjs = {};

(function() {

/**
 * TODO.
 * @class CSSPlugin
 * @constructor
 **/
var CSSPlugin = function() {
  throw("CSSPlugin cannot be instantiated.")
}
	
// static interface:
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
	
	CSSPlugin.priority = -100; // very low priority, should run last

	/**
	 * 
	 **/
	CSSPlugin.install = function(Tween) {
		Tween = Tween||createjs.Tween;
		var arr = [], map = CSSPlugin.cssSuffixMap;
		for (var n in map) { arr.push(n); }
		Tween.installPlugin(CSSPlugin, arr);
	}
	
	/**
	 * 
	 **/
	CSSPlugin.init = function(tween, prop, value) {
		var sfx0,sfx1,style,map = CSSPlugin.cssSuffixMap;
		if ((sfx0 = map[prop]) == null || !(style = tween._target.style)) { return value; }
		var str = style[prop];
		if (!str) { return 0; } // no style set.
		var i = str.length-sfx0.length;
		if ((sfx1 = str.substr(i)) != sfx0) {
			throw("CSSPlugin Error: Suffixes do not match. ("+sfx0+":"+sfx1+")");
		} else {
			return parseInt(str.substr(0,i));
		}
	}
	
	/** 
	 * 
	 **/
	CSSPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, position, end) {
		var style,map = CSSPlugin.cssSuffixMap;
		if (map[prop] == null || !(style = tween._target.style)) { return value; }
		style[prop] = value+map[prop];
		return value;
	}

// public properties:

// private properties:
	
// constructor:
	
// public methods:


// private methods:
	
createjs.CSSPlugin = CSSPlugin;
}());
