/*
* SamplePlugin
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
	 * A sample TweenJS plugin. This plugin does not actually affect tweens in any way, it's merely intended to document
	 * how to build TweenJS plugins. Please look at the code for inline comments.
	 *
	 * A TweenJS plugin is simply an object that exposes one property (priority), and three methods (init, step, and tween).
	 * Generally a plugin will also expose an <code>install</code> method as well, though this is not strictly necessary.
	 * @class SamplePlugin
	 * @constructor
	 **/
	function SamplePlugin() {
		throw("SamplePlugin cannot be instantiated.")
	};

// static interface:
	/**
	 * Used by TweenJS to determine when to call this plugin. Plugins with higher priority have their methods called
	 * before plugins with lower priority. The priority value can be any positive or negative number.
	 * @property priority
	 * @static
	 **/
	SamplePlugin.priority = 0;

	/**
	 * Installs this plugin for use with TweenJS, and registers for a list of properties that this plugin will operate
	 * with. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	SamplePlugin.install = function() {
		// this registers this plugin to work with the "test" property.
		createjs.Tween.installPlugin(SamplePlugin, ["test"]);
	};

	/**
	 * Called by TweenJS when a new property initializes on a tween. Generally, the call
	 * to <code>Plugin.init</code> will be immediately followed by a call to <code>Plugin.step</code>.
	 * 
	 * For example:
	 * 	foo.x = 0;
	 * 	foo.y = 100;
	 * 	
	 * 	Tween.get(foo)
	 * 		.to({x:10}) // init called with prop = "x", value = 0
	 * 		.to({x:20}) // init is NOT called
	 * 		.to({y:200}) // init called with prop = "y", value = 100
	 * 
	 * @method init
	 * @param {Tween} tween The related tween instance.
	 * @param {String} prop The name of the property that is being initialized.
	 * @param {any} value If another plugin has returned a starting value, it will be passed in. Otherwise value will be undefined.
	 * @return {any} The starting tween value for the property. In most cases, you would simply
	 * return the value parameter, but some plugins may need to modify the starting value. You can also return
	 * `Tween.IGNORE` to prevent this tween
	 * @static
	 **/
	SamplePlugin.init = function(tween, prop, value) {
		console.log("init: ", prop, value);
		
		// filter which properties you want to work on by using "prop":
		if (prop !== "x" && prop !== "y") { return value; }
		
		// you can grab the current value on the target using:
		var targetValue = tween.target[prop];
		
		// this would get the current starting value for the property, using value from previous plugins if specified, or the target value if not:
		// this is a bit of a pain, but it prevents accessing target values that aren't needed, which can be very expensive (ex. width on a HTMLElement, when we actually want to grab it from style)
		var defaultValue = (value === undefined) ? targetValue : value;
		
		// this would round the starting value of "x" properties:
		if (prop === "x") { return Math.round(defaultValue); }
		
		// this would tell the tween to not include the "y" property:
		// if (prop === "y") { return Tween.IGNORE }
		
		// you can attach arbitrary data to the tween for later use:
		var data = tween.pluginData;
		if (!data) { data = tween.pluginData = {}; } // to reduce GC churn, pluginData is null by default.
		data.SamplePlugin_foo = 200; // namespacing your values will help prevent conflicts
		
		// if you don't want to make changes, then makes sure to pass other plugins changes through:
		return value;
	};

	/**
	 * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
	 * 
	 * For example:
	 * 	Tween.get(foo)
	 * 		.to({x:10}) // step called with prop = "x"
	 * 		.to({y:100}) // step called with prop = "y"
	 * 		.to({x:20, y:200}) // step is called twice
	 * 
	 * @method init
	 * @param {Tween} tween The related tween instance.
	 * @param {TweenStep} step The related tween step. This class is currently undocumented. See the bottom of Tween.js for info.
	 * @param {String} prop The name of the property being tweened.
	 * @param {Object} injectProps If a previous plugin returned an injectProps object, it will be passed here.
	 * @return {Object} If you'd like to inject new properties into the tween, you can return a generic object with name value pairs. You should add to the existing injectProps object if it exists.
	 * @static
	 **/
	SamplePlugin.step = function(tween, step, prop, injectProps) {
		console.log("step: ", step, prop, injectProps);
		
		// filter which properties you want to work on by using "prop":
		if (prop !== "x") { return; }
		
		// you can grab the end value for the step via its props object:
		var endValue = step.props[prop];
		
		// similarly, you can grab the start value from previous step:
		var startValue = step.prev.props[prop];
		
		// you could even modify this step's end value:
		// step.props[prop] = Math.round(endValue);
		
		// or specify other properties that you'd like to include in the tween:
		// make sure you use the existing injectProps if it exists:
		// injectProps = injectProps||{}; // preserve other tween's injections
		// injectProps.foo = 27;
		// return injectProps;
		
		// you can attach arbitrary data to the step for later use:
		var data = step.pluginData;
		if (!data) { data = step.pluginData = {}; } // to reduce GC churn, pluginData is null by default.
		data.SamplePlugin_bar = 30; // namespacing your values will help prevent conflicts
	};

	/**
	 * Called before a property is by the tween.
	 * @method tween
	 * @param {Tween} tween The related tween instance.
	 * @param {TweenStep} step The related tween step. This class is currently undocumented. See the bottom of Tween.js for info.
	 * @param {String} prop The name of the property being tweened.
	 * @param {any} value The current tweened value of the property, as calculated by TweenJS. Previous plugins may have modified this value.
	 * @param {Number} ratio A value indicating the eased progress through the current step. This
	 * number is generally between 0 and 1, though some eases will generate values outside
	 * this range.
	 * @param {Boolean} end Indicates that the tween has reached the end.
	 * @return {any} Return the value that should be assigned to the target property.
	 * @static
	 **/
	SamplePlugin.tween = function(tween, step, prop, value, ratio, end) {
		// ratio is the eased ratio
		console.log("tween", step, prop, value, ratio, end);
		
		// filter which properties you want to work on by using "prop":
		if (prop !== "x") { return value; } // make sure you ALWAYS pass through value!
		
		// you can grab the end value for the step via its props object:
		var endValue = step.props[prop];
		
		// similarly, you can grab the start value from previous step:
		var startValue = step.prev.props[prop];
		
		// you could calculate the unmodified tweened value using the ratio:
		// this will be the same as "value" unless a previous plugin returned a modified value
		var unmodifiedValue = startValue + (endValue - startValue) * ratio;
		if (value !== unmodifiedValue) { /* a previous plugin modified the value */ }
		
		// check if the tween is currently in a "wait" by comparing the props objects of this and the previous step:
		var inWait = (step.props === step.prev.props);
		
		// tell the tween to not set the value on the target:
		// return Tween.IGNORE;
		
		// return the unmodified calculated tween value (use the default tweening behaviour):
		return value;
	};


	createjs.SamplePlugin = SamplePlugin;

}());
