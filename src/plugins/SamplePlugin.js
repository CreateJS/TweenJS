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

import Tween from "../Tween";

/**
 * A sample TweenJS plugin. This plugin is purely for demonstration, and contains documentation and helpful tips on
 * building plugins.
 *
 * It sets the y position of the target based on a sinusoidal function of its x position.
 *
 * A TweenJS plugin is simply an object that exposes two properties (id, priority), and three methods (init, step, and change).
 * Generally a plugin will also expose an <code>install</code> method as well, though this is not strictly necessary.
 * @class SamplePlugin
 * @module TweenJS
 * @static
 */
export default class SamplePlugin {

// constructor:
	/**
	 * @constructor
	 */
	constructor () {
		throw "SamplePlugin is static and cannot be instantiated.";
	}

// static methods:
	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 */
	static install () {
		// TODO: should we just do installPlugin vs Plugin.install? That's what our other libs do.
		Tween._installPlugin(SamplePlugin);
	}

	/**
	 * Called by TweenJS when a new property initializes on a tween. Generally, the call
	 * to `Plugin.init` will be immediately followed by a call to `Plugin.step`.
	 *
	 * For example:
	 *
	 *  foo.x = 0;
	 *  foo.y = 100;
	 * 	Tween.get(foo)
	 * 		.to({x:10}) // init called with prop = "x", value = 0
	 * 		.to({x:20}) // init is NOT called, since x was already inited
	 * 		.to({y:200}) // init called with prop = "y", value = 100
	 *
	 * @method init
	 * @param {Tween} tween The related tween instance.
	 * @param {String} prop The name of the property that is being initialized.
	 * @param {any} value If another plugin has modified the starting value, it will be passed in. Otherwise value will be undefined.
	 * @return {any} The modified starting tween value for the property. In most cases, you would simply wouldn't return anything,
	 * but some plugins may need to modify the starting value. You can also return `Tween.IGNORE` to prevent this prop
	 * from being added to the tween at all.
	 * @static
	 */
	static init (tween, prop, value) {
		console.log("init: ", prop, value);

		// its good practice to let users opt out (or in some cases, maybe in) via pluginData:
		let data = tween.pluginData;
		if (data.Sample_disabled) { return; }

		// this tells the tween to not manage the "y" property:
		if (prop === "y") { return Tween.IGNORE; }

		// filter which properties you want to work on by using "prop":
		// in this case, we only want to operate on the x property:
		if (prop !== "x") { return; } // make sure to pass through value.

		// we know we want to operate on this tween, so we add the plugin to it:
		// most plugins can just be a single shared plugin class:
		tween._addPlugin(SamplePlugin);

		// you can also use pluginData to attach arbitrary data to the tween for later use:
		// we want to adjust y relative to it's initial value, so let's save that off in pluginData:
		tween.pluginData.Sample_y = tween.target.y;


		// NOTE: none of the code below actually does anything in this scenario, it's just to illustrate concepts:

		// but you can also add an instance, if you wanted to store data on the plugin:
		// if you do this, ensure that there is an `id` property on the instance that matches the one on the class.
		// tween.addPlugin(new SamplePlugin());

		// note that it's also possible to create a plugin that doesn't add itself, but hooks into the "change" event instead.

		// you can grab the current value on the target using:
		let targetValue = tween.target[prop];

		// this gets the current starting value for the property, using value from previous plugins if specified, or the target value if not:
		// this is a bit of a pain, but it prevents accessing target values that aren't needed, which can be very expensive (ex. width on a HTMLElement, when we actually want to grab it from style)
		let defaultValue = (value === undefined) ? targetValue : value;

		// this passes out a new initial value for the x property:
		// if (prop === "x") { return Math.round(defaultValue); }
	}

	/**
	 * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
	 *
	 * For example:
	 * 	Tween.get(foo)
	 * 		.to({x:10}) // step called
	 * 		.to({y:100}) // step NOT called
	 * 		.to({x:20, y:200}) // step called
	 *
	 * @method step
	 * @param {Tween} tween The related tween instance.
	 * @param {TweenStep} step The related tween step. This class is currently undocumented. See the bottom of Tween.js for info.
	 * @param {Object} props The props object that was passed in for this step.
	 * @static
	 */
	static step (tween, step, props) {
		// the function of this plugin doesn't require us to react or modify new steps, so we'll just log it out for reference:
		console.log("step: ", step, prop, injectProps);

		// NOTE: none of the code below actually does anything in this scenario, it's just to illustrate concepts:

		// props is the collection of properties that were changed in this step.
		// you can use this to decide whether to do anything:
		if (props.x === undefined) { return; } // no change to x

		// because other plugins may modify the end value for this step, you should access it
		// via the step object, not the props object:
		let endValue = step.props.x;

		// you can grab the start value from the previous step:
		let startValue = step.prev.props.x;

		// you can modify this step's end value:
		// step.props.x = Math.max(0, Math.min(100, step.props.x));

		// if this was a plugin instance, you could store step specific data using step.index:
		// this.steps[step.index] = {arbitraryData:foo};

		// or specify other properties that you'd like to include in the tween:
		// tween._injectProp("y", 200);
	}

	/**
	 * Called before a property is updated by the tween.
	 * @method change
	 * @param {Tween} tween The related tween instance.
	 * @param {TweenStep} step The related tween step. This class is currently undocumented. See the bottom of Tween.js for info.
	 * @param {String} prop The name of the property being tweened.
	 * @param {any} value The current tweened value of the property, as calculated by TweenJS. Previous plugins may have modified this value.
	 * @param {Number} ratio A value indicating the eased progress through the current step. This number is generally between 0 and 1,
	 * though some eases will generate values outside this range.
	 * @param {Boolean} end Indicates that the tween has reached the end and is about to deregister itself.
	 * @return {any} Return the value that should be assigned to the target property.
	 * @static
	 */
	static change (tween, step, prop, value, ratio, end) {
		// console.log("tween", step, prop, value, ratio, end);

		// we want to manage the y property ourselves, so we can tell the tween to not update it:
		// Note that this is redundant here, because we told the tween to completely ignore y in `init`.
		if (prop === "y") { return Tween.IGNORE; }


		// filter which properties you want to work on by using "prop":
		if (prop !== "x") { return; }

		// set the y value on the target as a function of the x value:
		// use the pluginData value we saved earlier to make it relative to the starting y:
		tween.target.y = Math.sin(value/160*Math.PI)*50+tween.pluginData.Sample_y;

		// NOTE: none of the code below actually does anything in this scenario, it's just to illustrate concepts:

		// you can grab the end value for the step via its props object:
		let endValue = step.props[prop];

		// similarly, you can grab the start value from previous step:
		let startValue = step.prev.props[prop];

		// you could calculate the unmodified tweened value using the ratio:
		// this will be the same as "value" unless a previous plugin returned a modified value
		let unmodifiedValue = startValue + (endValue - startValue) * ratio;
		if (value !== unmodifiedValue) { /* a previous plugin modified the value */ }

		// check if the tween is currently in a "wait" by comparing the props objects of this and the previous step:
		let inWait = (step.props === step.prev.props);

		// you can return a modified value to be set on the target:
		// return Math.round(value);

		// or don't return anything to use the default value.
	}

}

// static properties:
/**
 * Used by TweenJS to determine when to call this plugin. Plugins with higher priority have their methods called
 * before plugins with lower priority. The priority value can be any positive or negative number.
 * @property priority
 * @type {Number}
 * @default 0
 * @static
 */
SamplePlugin.priority = 0;

/**
 * A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
 * If you're going to be installing instances of this plugin, you should ensure they have the same id as the class.
 * @property ID
 * @type {String}
 * @static
 */
SamplePlugin.prototype.ID = SamplePlugin.ID = "Sample";
