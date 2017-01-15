/*
* Tween
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
 * The TweenJS Javascript library provides a simple but powerful tweening interface. It supports tweening of both
 * numeric object properties & CSS style properties, and allows you to chain tweens and actions together to create
 * complex sequences.
 *
 * <h4>Simple Tween</h4>
 * This tween will tween the target's alpha property from 0 to 1 for 1s then call the <code>handleComplete</code> function.
 *
 *	    target.alpha = 0;
 *	    createjs.Tween.get(target).to({alpha:1}, 1000).call(handleComplete);
 *	    function handleComplete() {
 *	    	//Tween complete
 *	    }
 *
 * <strong>Arguments and Scope</strong>
 * Tween also supports a `call()` with arguments and/or a scope. If no scope is passed, then the function is called
 * anonymously (normal JavaScript behaviour). The scope is useful for maintaining scope when doing object-oriented
 * style development.
 *
 *      createjs.Tween.get(target).to({alpha:0})
 *          .call(handleComplete, [argument1, argument2], this);
 *
 * <h4>Chainable Tween</h4>
 * This tween will wait 0.5s, tween the target's alpha property to 0 over 1s, set it's visible to false, then call the
 * <code>handleComplete</code> function.
 *
 *	    target.alpha = 1;
 *	    createjs.Tween.get(target).wait(500).to({alpha:0, visible:false}, 1000).call(handleComplete);
 *	    function handleComplete() {
 *	    	//Tween complete
 *	    }
 *
 * <h4>Browser Support</h4>
 * TweenJS will work in all browsers.
 *
 * @module TweenJS
 * @main TweenJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
	"use strict";


// constructor
	/**
	 * Tweens properties for a single target. Methods can be chained to create complex animation sequences:
	 *
	 * <h4>Example</h4>
	 *
	 *	createjs.Tween.get(target)
	 *		.wait(500)
	 *		.to({alpha:0, visible:false}, 1000)
	 *		.call(handleComplete);
	 *
	 * Multiple tweens can share a target, however if they affect the same properties there could be unexpected
	 * behaviour. To stop all tweens on an object, use {{#crossLink "Tween/removeTweens"}}{{/crossLink}} or pass `override:true`
	 * in the props argument.
	 *
	 * 	createjs.Tween.get(target, {override:true}).to({x:100});
	 *
	 * Subscribe to the {{#crossLink "Tween/change:event"}}{{/crossLink}} event to be notified when the tween position changes.
	 *
	 * 	createjs.Tween.get(target, {override:true}).to({x:100}).addEventListener("change", handleChange);
	 * 	function handleChange(event) {
	 * 		// The tween changed.
	 * 	}
	 *
	 * See the {{#crossLink "Tween/get"}}{{/crossLink}} method also.
	 * @class Tween
	 * @param {Object} target The target object that will have its properties tweened.
	 * @param {Object} [props] The configuration properties to apply to this instance (ex. `{loop:-1, paused:true}`).
	 * Supported props are listed below. These props are set on the corresponding instance properties except where
	 * specified.<UL>
	 *    <LI> `useTicks`</LI>
	 *    <LI> `ignoreGlobalPause`</LI>
	 *    <LI> `loop`</LI>
	 *    <LI> `reversed`</LI>
	 *    <LI> `bounce`</LI>
	 *    <LI> `timeScale`</LI>
	 *    <LI> `pluginData`</LI>
	 *    <LI> `paused`: indicates whether to start the tween paused.</LI>
	 *    <LI> `position`: indicates the initial position for this tween.</LI>
	 *    <LI> `onChange`: adds the specified function as a listener to the `change` event</LI>
	 *    <LI> `onComplete`: adds the specified function as a listener to the `complete` event</LI>
	 *    <LI> `override`: if true, removes all existing tweens for the target</LI>
	 * </UL>
	 * @extends AbstractTween
	 * @constructor
	 */
	function Tween(target, props) {
		this.AbstractTween_constructor(props);
		
	// public properties:
	
		/**
		 * Allows you to specify data that will be used by installed plugins. Each plugin uses this differently, but in general
		 * you specify data by assigning it to a property of `pluginData` with the same name as the plugin.
		 * Note that in many cases, this data is used as soon as the plugin initializes itself for the tween.
		 * As such, this data should be set before the first `to` call in most cases.
		 * @example
		 *	myTween.pluginData.SmartRotation = data;
		 * 
		 * Most plugins also support a property to disable them for a specific tween. This is typically the plugin name followed by "_disabled".
		 * @example
		 *	myTween.pluginData.SmartRotation_disabled = true;
		 * 
		 * Some plugins also store working data in this object, usually in a property named `_PluginClassName`.
		 * See the documentation for individual plugins for more details.
		 * @property pluginData
		 * @type {Object}
		 */
		this.pluginData = null;
	
		/**
		 * The target of this tween. This is the object on which the tweened properties will be changed.
		 * @property target
		 * @type {Object}
		 * @readonly
		 */
		this.target = target;
	
		/**
		 * Indicates the tween's current position is within a passive wait.
		 * @property passive
		 * @type {Boolean}
		 * @default false
		 * @readonly
		 **/
		this.passive = false;
		
		
	// private properties:
	
		/**
		 * @property _stepHead
		 * @type {TweenStep}
		 * @protected
		 */
		this._stepHead = new TweenStep(null, 0, 0, {}, null, true);
		
		/**
		 * @property _stepTail
		 * @type {TweenStep}
		 * @protected
		 */
		this._stepTail = this._stepHead;
		
		/**
		 * The position within the current step. Used by MovieClip.
		 * @property _stepPosition
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		this._stepPosition = 0;
		
		/**
		 * @property _actionHead
		 * @type {TweenAction}
		 * @protected
		 */
		this._actionHead = null;
		
		/**
		 * @property _actionTail
		 * @type {TweenAction}
		 * @protected
		 */
		this._actionTail = null;
		
		/**
		 * Plugins added to this tween instance.
		 * @property _plugins
		 * @type Array[Object]
		 * @default null
		 * @protected
		 */
		this._plugins = null;
		
		/**
		 * Hash for quickly looking up added plugins. Null until a plugin is added.
		 * @property _plugins
		 * @type Object
		 * @default null
		 * @protected
		 */
		this._pluginIds = null;
		
		/**
		 * Used by plugins to inject new properties.
		 * @property _injected
		 * @type {Object}
		 * @default null
		 * @protected
		 */
		this._injected = null;

		if (props) {
			this.pluginData = props.pluginData;
			if (props.override) { Tween.removeTweens(target); }
		}
		if (!this.pluginData) { this.pluginData = {}; }
		
		this._init(props);
	};

	var p = createjs.extend(Tween, createjs.AbstractTween);

	// TODO: deprecated
	// p.initialize = function() {}; // searchable for devs wondering where it is. REMOVED. See docs for details.
	

// static properties

	/**
	 * Constant returned by plugins to tell the tween not to use default assignment.
	 * @property IGNORE
	 * @type Object
	 * @static
	 */
	Tween.IGNORE = {};

	/**
	 * @property _listeners
	 * @type Array[Tween]
	 * @static
	 * @protected
	 */
	Tween._tweens = [];

	/**
	 * @property _plugins
	 * @type Object
	 * @static
	 * @protected
	 */
	Tween._plugins = null;
	
	/**
	 * @property _tweenHead
	 * @type Tween
	 * @static
	 * @protected
	 */
	Tween._tweenHead = null;
	
	/**
	 * @property _tweenTail
	 * @type Tween
	 * @static
	 * @protected
	 */
	Tween._tweenTail = null;


// static methods	
	/**
	 * Returns a new tween instance. This is functionally identical to using `new Tween(...)`, but may look cleaner
	 * with the chained syntax of TweenJS.
	 * <h4>Example</h4>
	 *
	 *	var tween = createjs.Tween.get(target).to({x:100}, 500);
	 *	// equivalent to:
	 *	var tween = new createjs.Tween(target).to({x:100}, 500);
	 *
	 * @method get
	 * @param {Object} target The target object that will have its properties tweened.
	 * @param {Object} [props] The configuration properties to apply to this instance (ex. `{loop:-1, paused:true}`).
	 * Supported props are listed below. These props are set on the corresponding instance properties except where
	 * specified.<UL>
	 *    <LI> `useTicks`</LI>
	 *    <LI> `ignoreGlobalPause`</LI>
	 *    <LI> `loop`</LI>
	 *    <LI> `reversed`</LI>
	 *    <LI> `bounce`</LI>
	 *    <LI> `timeScale`</LI>
	 *    <LI> `pluginData`</LI>
	 *    <LI> `paused`: indicates whether to start the tween paused.</LI>
	 *    <LI> `position`: indicates the initial position for this tween.</LI>
	 *    <LI> `onChange`: adds the specified function as a listener to the `change` event</LI>
	 *    <LI> `onComplete`: adds the specified function as a listener to the `complete` event</LI>
	 *    <LI> `override`: if true, removes all existing tweens for the target</LI>
	 * </UL>
	 * @return {Tween} A reference to the created tween.
	 * @static
	 */
	Tween.get = function(target, props) {
		return new Tween(target, props);
	};

	/**
	 * Advances all tweens. This typically uses the {{#crossLink "Ticker"}}{{/crossLink}} class, but you can call it
	 * manually if you prefer to use your own "heartbeat" implementation.
	 * @method tick
	 * @param {Number} delta The change in time in milliseconds since the last tick. Required unless all tweens have
	 * `useTicks` set to true.
	 * @param {Boolean} paused Indicates whether a global pause is in effect. Tweens with {{#crossLink "Tween/ignoreGlobalPause:property"}}{{/crossLink}}
	 * will ignore this, but all others will pause if this is `true`.
	 * @static
	 */
	Tween.tick = function(delta, paused) {
		var tween = Tween._tweenHead;
		while (tween) {
			var next = tween._next; // in case it completes and wipes its _next property
			if ((paused && !tween.ignoreGlobalPause) || tween._paused) { /* paused */ }
			else { tween.advance(tween.useTicks?1:delta); }
			tween = next;
		}
	};

	/**
	 * Handle events that result from Tween being used as an event handler. This is included to allow Tween to handle
	 * {{#crossLink "Ticker/tick:event"}}{{/crossLink}} events from the createjs {{#crossLink "Ticker"}}{{/crossLink}}.
	 * No other events are handled in Tween.
	 * @method handleEvent
	 * @param {Object} event An event object passed in by the {{#crossLink "EventDispatcher"}}{{/crossLink}}. Will
	 * usually be of type "tick".
	 * @private
	 * @static
	 * @since 0.4.2
	 */
	Tween.handleEvent = function(event) {
		if (event.type === "tick") {
			this.tick(event.delta, event.paused);
		}
	};

	/**
	 * Removes all existing tweens for a target. This is called automatically by new tweens if the `override`
	 * property is `true`.
	 * @method removeTweens
	 * @param {Object} target The target object to remove existing tweens from.
	 * @static
	 */
	Tween.removeTweens = function(target) {
		if (!target.tweenjs_count) { return; }
		var tween = Tween._tweenHead;
		while (tween) {
			var next = tween._next;
			if (tween.target === target) { Tween._register(tween, true); }
			tween = next;
		}
		target.tweenjs_count = 0;
	};

	/**
	 * Stop and remove all existing tweens.
	 * @method removeAllTweens
	 * @static
	 * @since 0.4.1
	 */
	Tween.removeAllTweens = function() {
		var tween = Tween._tweenHead;
		while (tween) {
			var next = tween._next;
			tween._paused = true;
			tween.target&&(tween.target.tweenjs_count = 0);
			tween._next = tween._prev = null;
			tween = next;
		}
		Tween._tweenHead = Tween._tweenTail = null;
	};

	/**
	 * Indicates whether there are any active tweens on the target object (if specified) or in general.
	 * @method hasActiveTweens
	 * @param {Object} [target] The target to check for active tweens. If not specified, the return value will indicate
	 * if there are any active tweens on any target.
	 * @return {Boolean} Indicates if there are active tweens.
	 * @static
	 */
	Tween.hasActiveTweens = function(target) {
		if (target) { return !!target.tweenjs_count; }
		return !!Tween._tweenHead;
	};

	/**
	 * Installs a plugin, which can modify how certain properties are handled when tweened. See the {{#crossLink "SamplePlugin"}}{{/crossLink}}
	 * for an example of how to write TweenJS plugins. Plugins should generally be installed via their own `install` method, in order to provide
	 * the plugin with an opportunity to configure itself.
	 * @method _installPlugin
	 * @param {Object} plugin The plugin to install
	 * @static
	 * @protected
	 */
	Tween._installPlugin = function(plugin) {
		var priority = plugin.priority, arr = Tween._plugins;
		if (priority == null) { plugin.priority = priority = 0; }
		if (!arr) { arr = Tween._plugins = []; }
		for (var i=0,l=arr.length;i<l;i++) {
			if (priority < arr[i].priority) { break; }
		}
		arr.splice(i,0,plugin);
	};

	/**
	 * Registers or unregisters a tween with the ticking system.
	 * @method _register
	 * @param {Tween} tween The tween instance to register or unregister.
	 * @param {Boolean} paused If `false`, the tween is registered. If `true` the tween is unregistered.
	 * @static
	 * @protected
	 */
	Tween._register = function(tween, paused) {
		var target = tween.target;
		if (!paused && tween._paused) {
			// TODO: this approach might fail if a dev is using sealed objects
			if (target) { target.tweenjs_count = target.tweenjs_count ? target.tweenjs_count+1 : 1; }
			var tail = Tween._tweenTail;
			if (!tail) { Tween._tweenHead = Tween._tweenTail = tween; }
			else {
				Tween._tweenTail = tail._next = tween;
				tween._prev = tail;
			}
			if (!Tween._inited && createjs.Ticker) { createjs.Ticker.addEventListener("tick", Tween); Tween._inited = true; }
		} else if (paused && !tween._paused) {
			if (target) { target.tweenjs_count--; }
			var next = tween._next, prev = tween._prev;
			
			if (next) { next._prev = prev; }
			else { Tween._tweenTail = prev; } // was tail
			if (prev) { prev._next = next; }
			else { Tween._tweenHead = next; } // was head.
			
			tween._next = tween._prev = null;
		}
		tween._paused = paused;
	};


// events:

// public methods:
	/**
	 * Adds a wait (essentially an empty tween).
	 * <h4>Example</h4>
	 *
	 *	//This tween will wait 1s before alpha is faded to 0.
	 *	createjs.Tween.get(target).wait(1000).to({alpha:0}, 1000);
	 *
	 * @method wait
	 * @param {Number} duration The duration of the wait in milliseconds (or in ticks if `useTicks` is true).
	 * @param {Boolean} [passive=false] Tween properties will not be updated during a passive wait. This
	 * is mostly useful for use with {{#crossLink "Timeline"}}{{/crossLink}} instances that contain multiple tweens
	 * affecting the same target at different times.
	 * @return {Tween} This tween instance (for chaining calls).
	 * @chainable
	 **/
	p.wait = function(duration, passive) {
		if (duration > 0) { this._addStep(duration, this._stepTail.props, null, passive); }
		return this;
	};

	/**
	 * Adds a tween from the current values to the specified properties. Set duration to 0 to jump to these value.
	 * Numeric properties will be tweened from their current value in the tween to the target value. Non-numeric
	 * properties will be set at the end of the specified duration.
	 * <h4>Example</h4>
	 *
	 *	createjs.Tween.get(target).to({alpha:0, visible:false}, 1000);
	 *
	 * @method to
	 * @param {Object} props An object specifying property target values for this tween (Ex. `{x:300}` would tween the x
	 * property of the target to 300).
	 * @param {Number} [duration=0] The duration of the tween in milliseconds (or in ticks if `useTicks` is true).
	 * @param {Function} [ease="linear"] The easing function to use for this tween. See the {{#crossLink "Ease"}}{{/crossLink}}
	 * class for a list of built-in ease functions.
	 * @return {Tween} This tween instance (for chaining calls).
	 * @chainable
	 */
	p.to = function(props, duration, ease) {
		if (duration == null || duration < 0) { duration = 0; }
		var step = this._addStep(duration, null, ease);
		this._appendProps(props, step);
		return this;
	};
	
	/**
	 * Adds a label that can be used with {{#crossLink "Tween/gotoAndPlay"}}{{/crossLink}}/{{#crossLink "Tween/gotoAndStop"}}{{/crossLink}}
	 * at the current point in the tween. For example:
	 * 
	 * 	var tween = createjs.Tween.get(foo)
	 * 					.to({x:100}, 1000)
	 * 					.label("myLabel")
	 * 					.to({x:200}, 1000);
	 * // ...
	 * tween.gotoAndPlay("myLabel"); // would play from 1000ms in.
	 * 
	 * @method addLabel
	 * @param {String} label The label name.
	 * @param {Number} position The position this label represents.
	 * @return {Tween} This tween instance (for chaining calls).
	 * @chainable
	 **/
	p.label = function(name) {
		this.addLabel(name, this.duration);
		return this;
	};

	/**
	 * Adds an action to call the specified function.
	 * <h4>Example</h4>
	 *
	 * 	//would call myFunction() after 1 second.
	 * 	createjs.Tween.get().wait(1000).call(myFunction);
	 *
	 * @method call
	 * @param {Function} callback The function to call.
	 * @param {Array} [params]. The parameters to call the function with. If this is omitted, then the function
	 * will be called with a single param pointing to this tween.
	 * @param {Object} [scope]. The scope to call the function in. If omitted, it will be called in the target's scope.
	 * @return {Tween} This tween instance (for chaining calls).
	 * @chainable
	 */
	p.call = function(callback, params, scope) {
		return this._addAction(scope||this.target, callback, params||[this]);
	};

	/**
	 * Adds an action to set the specified props on the specified target. If `target` is null, it will use this tween's
	 * target. Note that for properties on the target object, you should consider using a zero duration {{#crossLink "Tween/to"}}{{/crossLink}}
	 * operation instead so the values are registered as tweened props.
	 * <h4>Example</h4>
	 *
	 *	myTween.wait(1000).set({visible:false}, foo);
	 *
	 * @method set
	 * @param {Object} props The properties to set (ex. `{visible:false}`).
	 * @param {Object} [target] The target to set the properties on. If omitted, they will be set on the tween's target.
	 * @return {Tween} This tween instance (for chaining calls).
	 * @chainable
	 */
	p.set = function(props, target) {
		return this._addAction(target||this.target, this._set, [props]);
	};

	/**
	 * Adds an action to play (unpause) the specified tween. This enables you to sequence multiple tweens.
	 * <h4>Example</h4>
	 *
	 *	myTween.to({x:100}, 500).play(otherTween);
	 *
	 * @method play
	 * @param {Tween} [tween] The tween to play. Defaults to this tween.
	 * @return {Tween} This tween instance (for chaining calls).
	 * @chainable
	 */
	p.play = function(tween) {
		return this.call(this.setPaused, [false], tween||this);
	};

	/**
	 * Adds an action to pause the specified tween.
	 * 
	 * 	myTween.pause(otherTween).to({alpha:1}, 1000).play(otherTween);
	 * 
	 * Note that this executes at the end of a tween update, so the tween may advance beyond the time the pause
	 * action was inserted at. For example:
	 * 
	 * myTween.to({foo:0}, 1000).pause().to({foo:1}, 1000);
	 * 
	 * At 60fps the tween will advance by ~16ms per tick, if the tween above was at 999ms prior to the current tick, it
	 * will advance to 1015ms (15ms into the second "step") and then pause.
	 * 
	 * @method pause
	 * @param {Tween} [tween] The tween to pause. Defaults to this tween.
	 * @return {Tween} This tween instance (for chaining calls)
	 * @chainable
	 */
	p.pause = function(tween) {
		return this.call(this.setPaused, [true], tween||this);
	};

	// tiny api (primarily for tool output):
	p.w = p.wait;
	p.t = p.to;
	p.c = p.call;
	p.s = p.set;

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 */
	p.toString = function() {
		return "[Tween]";
	};

	/**
	 * @method clone
	 * @protected
	 */
	p.clone = function() {
		throw("Tween can not be cloned.")
	};


// private methods:
	/**
	 * Adds a plugin to this tween.
	 * @method _addPlugin
	 * @param {Object} plugin
	 * @protected
	 */
	p._addPlugin = function(plugin) {
		var ids = this._pluginIds || (this._pluginIds = {}), id = plugin.ID;
		if (!id || ids[id]) { return; } // already added
		
		ids[id] = true;
		var plugins = this._plugins || (this._plugins = []), priority = plugin.priority || 0;
		for (var i=0,l=plugins.length; i<l; i++) {
			if (priority < plugins[i].priority) {
				plugins.splice(i,0,plugin);
				return;
			}
		}
		plugins.push(plugin);
	};
	
	// Docced in AbstractTween
	p._updatePosition = function(jump, end) {
		var step = this._stepHead.next, t=this.position, d=this.duration;
		if (this.target && step) {
			// find our new step index:
			var stepNext = step.next;
			while (stepNext && stepNext.t <= t) { step = step.next; stepNext = step.next; }
			var ratio = end ? t/d : (t-step.t)/step.d; // TODO: revisit this.
			this._updateTargetProps(step, ratio, end);
		}
		this._stepPosition = step ? t-step.t : 0;
	};
	
	/**
	 * @method _updateTargetProps
	 * @param {Object} step
	 * @param {Number} ratio
	 * @param {Boolean} end Indicates to plugins that the full tween has ended.
	 * @protected
	 */
	p._updateTargetProps = function(step, ratio, end) {
		if (this.passive = !!step.passive) { return; } // don't update props.
		
		var v, v0, v1, ease;
		var p0 = step.prev.props;
		var p1 = step.props;
		if (ease = step.ease) { ratio = ease(ratio,0,1,1); }
		
		var plugins = this._plugins;
		proploop : for (var n in p0) {
			v = v0 = p0[n];
			v1 = p1[n];
			
			// values are different & it is numeric then interpolate:
			if (v0 !== v1 && (typeof(v0) === "number")) {
				v = v0+(v1-v0)*ratio;
			}
			
			if (plugins) {
				for (var i=0,l=plugins.length;i<l;i++) {
					var value = plugins[i].change(this, step, n, v, ratio, end);
					if (value === Tween.IGNORE) { continue proploop; }
					if (value !== undefined) { v = value; }
				}
			}
			this.target[n] = v;
		}

	};
	
	/**
	 * @method _runActionsRange
	 * @param {Number} startPos
	 * @param {Number} endPos
	 * @param {Boolean} includeStart
	 * @protected
	 */
	p._runActionsRange = function(startPos, endPos, jump, includeStart) {
		var rev = startPos > endPos;
		var action = rev ? this._actionTail : this._actionHead;
		var ePos = endPos, sPos = startPos;
		if (rev) { ePos=startPos; sPos=endPos; }
		var t = this.position;
		while (action) {
			var pos = action.t;
			if (pos === endPos || (pos > sPos && pos < ePos) || (includeStart && pos === startPos)) {
				action.funct.apply(action.scope, action.params);
				if (t !== this.position) { return true; }
			}
			action = rev ? action.prev : action.next;
		}
	};

	/**
	 * @method _appendProps
	 * @param {Object} props
	 * @protected
	 */
	p._appendProps = function(props, step, stepPlugins) {
		var initProps = this._stepHead.props, target = this.target, plugins = Tween._plugins;
		var n, i, l, value, initValue, inject;
		var oldStep = step.prev, oldProps = oldStep.props;
		var stepProps = step.props = this._cloneProps(oldProps);

		for (n in props) {
			stepProps[n] = props[n];

			if (initProps[n] !== undefined) { continue; }

			initValue = undefined; // accessing missing properties on DOMElements when using CSSPlugin is INSANELY expensive, so we let the plugin take a first swing at it.
			if (plugins) {
				for (i = 0, l = plugins.length; i < l; i++) {
					value = plugins[i].init(this, n, initValue);
					if (value !== undefined) { initValue = value; }
					if (initValue === Tween.IGNORE) {
						delete(stepProps[n]);
						delete(props[n]);
						break;
					}
				}
			}

			if (initValue !== Tween.IGNORE) {
				if (initValue === undefined) { initValue = target[n]; }
				oldProps[n] = (initValue === undefined) ? null : initValue;
			}
		}
		
		for (n in props) {
			value = props[n];

			// propagate old value to previous steps:
			var o, prev=oldStep;
			while ((o = prev) && (prev = o.prev)) {
				if (prev.props === o.props) { continue; } // wait step
				if (prev.props[n] !== undefined) { break; } // already has a value, we're done.
				prev.props[n] = oldProps[n];
			}
		}
		
		if (stepPlugins !== false && (plugins = this._plugins)) {
			for (i = 0, l = plugins.length; i < l; i++) {
				plugins[i].step(this, step, props);
			}
		}
		
		if (inject = this._injected) {
			this._injected = null;
			this._appendProps(inject, step, false);
		}
	};
	
	/**
	 * Used by plugins to inject properties onto the current step. Called from within `Plugin.step` calls.
	 * For example, a plugin dealing with color, could read a hex color, and inject red, green, and blue props into the tween.
	 * See the SamplePlugin for more info.
	 * @method _injectProp
	 * @param {String} name
	 * @param {Object} value
	 * @protected
	 */
	p._injectProp = function(name, value) {
		var o = this._injected || (this._injected = {});
		o[name] = value;
	};

	/**
	 * @method _addStep
	 * @param {Number} duration
	 * @param {Object} props
	 * @param {Function} ease
	 * @param {Boolean} passive
	 * @protected
	 */
	p._addStep = function(duration, props, ease, passive) {
		var step = new TweenStep(this._stepTail, this.duration, duration, props, ease, passive||false);
		this.duration += duration;
		return this._stepTail = (this._stepTail.next = step);
	};

	/**
	 * @method _addAction
	 * @param {Object} scope
	 * @param {Function} funct
	 * @param {Array} params
	 * @protected
	 */
	p._addAction = function(scope, funct, params) {
		var action = new TweenAction(this._actionTail, this.duration, scope, funct, params);
		if (this._actionTail) { this._actionTail.next = action; }
		else { this._actionHead = action; }
		this._actionTail = action;
		return this;
	};

	/**
	 * @method _set
	 * @param {Object} props
	 * @protected
	 */
	p._set = function(props) {
		for (var n in props) {
			this[n] = props[n];
		}
	};

	/**
	 * @method _cloneProps
	 * @param {Object} props
	 * @protected
	 */
	p._cloneProps = function(props) {
		var o = {};
		for (var n in props) { o[n] = props[n]; }
		return o;
	};

	createjs.Tween = createjs.promote(Tween, "AbstractTween");
	
	function TweenStep(prev, t, d, props, ease, passive) {
		this.next = null;
		this.prev = prev;
		this.t = t;
		this.d = d;
		this.props = props;
		this.ease = ease;
		this.passive = passive;
		this.index = prev ? prev.index+1 : 0;
	};
	
	function TweenAction(prev, t, scope, funct, params) {
		this.next = null;
		this.prev = prev;
		this.t = t;
		this.d = 0;
		this.scope = scope;
		this.funct = funct;
		this.params = params;
	};
}());
