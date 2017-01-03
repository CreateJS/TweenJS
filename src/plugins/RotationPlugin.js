/*
* RotationPlugin
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

this.createjs = this.createjs||{};

(function() {
	"use strict";

	/**
	 * The RotationPlugin for TweenJS modifies tweens of rotation properties. These properties can be changed using the
	 * `RotationPlugin.props` property. Install using:
	 * 
	 * 	RotationPlugin.install();
	 * 
	 * After installation, by default all rotation tweens will rotate in the shortest direction. For example, if you
	 * tween from `rotation=15` to `rotation=330`, it will rotate counter-clockwise. You can modify this behaviour by
	 * specifying a `rotationDir` tween value. A value of `-1` will force CCW rotation, `1` will force CW, and `0` will
	 * disable the plugin effects for that portion of the tween.
	 * 
	 * Note that the `rotationDir` value will persist until overridden in future `to` calls.
	 * 
	 * 	// this tween will rotate: CCW, then CCW (persisted), then CW.
	 * 	myTween.get(foo).to({rotation:30, rotationDir:-1}).to({rotation:60}).to({rotation:10, rotationDir:1});
	 * 
	 * You can also disable the plugin completely for a tween by setting `tween.pluginData.Rotation_disabled=true`.
	 * 
	 * @class RotationPlugin
	 * @static
	 **/
	function RotationPlugin() {
		throw("SmartRotation plugin cannot be instantiated.")
	}
	var s = RotationPlugin;
	
	/**
	 * An object defining the properties this tween acts on. For example, setting `RotationPlugin.props = {angle:true}`
	 * will cause the plugin to only act on the `angle` property. By default the properties are `rotation`
	 * `rotationX`, `rotationY`, and `rotationZ`.
	 * @property props
	 * @type {Object}
	 * @static
	 **/
	s.props = {rotation:1, rotationX:1, rotationY:1, rotationZ:1};

	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	s.install = function() {
		createjs.Tween._installPlugin(RotationPlugin);
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
		if (s.props[prop] && !data.Rotation_installed && !data.Rotation_disabled) {
			tween._addPlugin(s);
			data.Rotation_installed = true;
		}
	};
	
	/**
	 * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
	 * See {{#crossLink "SamplePlugin/init"}}{{/crossLink}} for more info.
	 * @method init
	 * @param {Tween} tween
	 * @param {TweenStep} step
	 * @param {String} prop
	 * @param {String} value
	 * @return {any}
	 * @static
	 **/
	s.step = function(tween, step, prop, value) {
		if (!s.props[prop]) { return; }
		tween.pluginData.Rotation_end = value;
		var dir;
		if ((dir = step.props.rotationDir) === 0) { return; }
		
		dir = dir||0;
		var start = step.prev.props[prop];
		var delta = (value-start)%360;
		
		if ((dir === 0 && delta > 180) || (dir===-1 && delta > 0)) { delta -= 360; }
		else if ((dir === 0 && delta < -180) || (dir ===1 && delta < 0)) { delta += 360; }
		return start+delta;
	};

	/**
	 * Called before a property is updated by the tween.
	 * See {{#crossLink "SamplePlugin/init"}}{{/crossLink}} for more info.
	 * @method tween
	 * @param {Tween} tween
	 * @param {TweenStep} step
	 * @param {String} prop
	 * @param {any} value
	 * @param {Number} ratio
	 * @param {Boolean} end
	 * @return {any}
	 * @static
	 **/
	s.tween = function(tween, step, prop, value, ratio, end) {
		if (prop === "rotationDir") { return createjs.Tween.IGNORE; }
		if (end && s.props[prop]) { return tween.pluginData.Rotation_end; }
	};

	createjs.RotationPlugin = s;
}());
