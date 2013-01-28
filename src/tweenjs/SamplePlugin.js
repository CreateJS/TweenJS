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

// namespace:
this.createjs = this.createjs||{};

(function() {
/**
 * A sample TweenJS plugin. This plugin does not actually affect tweens in any way, it's merely intended to document
 * how to build TweenJS plugins. Please look at the code for inline comments.
 *
 * A TweenJS plugin is simply an object that exposes one property (priority), and three methods (init, step, and tween).
 * Generally a plugin will also expose an <code>install</code> method as well, though this is not strictly necessary.
 * @class SamplePlugin
 * @constructor
 **/
var SamplePlugin = function() {
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
	 * Called by TweenJS when a new tween property initializes that this plugin is registered for. Generally, the call
	 * to <code>Plugin.init</code> will be immediately followed by a call to <code>Plugin.to</code>.
	 * @method init
	 * @param {Tween} tween The related tween instance.
	 * @param {String} prop The name of the property that is being initialized.
	 * @param {any} value The current value of the property on the tween's target.
	 * @return {any} The starting tween value for the property. In most cases, you would simply
	 * return the value parameter, but some plugins may need to modify the starting value.
	 * @static
	 **/
	SamplePlugin.init = function(tween, prop, value) {
		console.log("init", prop, value);
		
		// return the unmodified property value:
		return value;
	};
	
	/**
	 * Called by TweenJS when a new step is added to a tween that includes a property the plugin is registered for (ie.
	 * a new "to" action is added to a tween).
	 * @method init
	 * @param {Tween} tween The related tween instance.
	 * @param {String} prop The name of the property being tweened.
	 * @param {any} startValue The value of the property at the beginning of the step. This will
	 * be the same as the init value if this is the first step, or the same as the
	 * endValue of the previous step if not.
	 * @param {Object} injectProps A generic object to which the plugin can append other properties which should be updated on this step.
	 * @param {any} endValue The value of the property at the end of the step.
	 * @static
	 **/
	SamplePlugin.step = function(tween, prop, startValue, endValue, injectProps) {
		console.log("to: ", prop, startValue, endValue);
	};
	
	/**
	 * Called when a tween property advances that this plugin is registered for.
	 * @method tween
	 * @param {Tween} tween The related tween instance.
	 * @param {String} prop The name of the property being tweened.
	 * @param {any} value The current tweened value of the property, as calculated by TweenJS.
	 * @param {Object} startValues A hash of all of the property values at the start of the current
	 * step. You could access the start value of the current property using
	 * startValues[prop].
	 * @param {Object} endValues A hash of all of the property values at the end of the current
	 * step.
	 * @param {Number} ratio A value indicating the eased progress through the current step. This
	 * number is generally between 0 and 1, though some eases will generate values outside
	 * this range.
	 * @param {Boolean} wait Indicates whether the current step is a "wait" step.
	 * @param {Boolean} end Indicates that the tween has reached the end.
	 * @return {any} Return the value that should be assigned to the target property. For example
	 * returning <code>Math.round(value)</code> would assign the default calculated value
	 * as an integer. Returning Tween.IGNORE will prevent Tween from assigning a value to
	 * the target property.
	 * @static
	 **/
	SamplePlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		// ratio is the eased ratio
		console.log("tween", prop, value, ratio, wait, end);
		
		// return the unmodified calculated tween value (use the default tweening behaviour):
		return value;
	};
	
createjs.SamplePlugin = SamplePlugin;
}());
