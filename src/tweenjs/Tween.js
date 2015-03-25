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

// TODO: possibly add a END actionsMode (only runs actions that == position)?
// TODO: evaluate a way to decouple paused from tick registration.

// namespace:
this.createjs = this.createjs||{};

(function() {
	"use strict";


// constructor
	/**
	 * A Tween instance tweens properties for a single target. Instance methods can be chained for easy construction and sequencing:
	 *
	 * <h4>Example</h4>
	 *
	 *      target.alpha = 1;
	 *	    createjs.Tween.get(target)
	 *	         .wait(500)
	 *	         .to({alpha:0, visible:false}, 1000)
	 *	         .call(handleComplete);
	 *	    function handleComplete() {
	 *	    	//Tween complete
	 *	    }
	 *
	 * Multiple tweens can point to the same instance, however if they affect the same properties there could be unexpected
	 * behaviour. To stop all tweens on an object, use {{#crossLink "Tween/removeTweens"}}{{/crossLink}} or pass `override:true`
	 * in the props argument.
	 *
	 *      createjs.Tween.get(target, {override:true}).to({x:100});
	 *
	 * Subscribe to the {{#crossLink "Tween/change:event"}}{{/crossLink}} event to get notified when a property of the
	 * target is changed.
	 *
	 *      createjs.Tween.get(target, {override:true}).to({x:100}).addEventListener("change", handleChange);
	 *      function handleChange(event) {
	 *          // The tween changed.
	 *      }
	 *
	 * See the Tween {{#crossLink "Tween/get"}}{{/crossLink}} method for additional param documentation.
	 * @class Tween
	 * @param {Object} target The target object that will have its properties tweened.
	 * @param {Object} [props] The configuration properties to apply to this tween instance (ex. `{loop:true, paused:true}`.
	 * All properties default to false. Supported props are:<UL>
	 *    <LI> loop: sets the loop property on this tween.</LI>
	 *    <LI> useTicks: uses ticks for all durations instead of milliseconds.</LI>
	 *    <LI> ignoreGlobalPause: sets the {{#crossLink "Tween/ignoreGlobalPause:property"}}{{/crossLink}} property on this tween.</LI>
	 *    <LI> override: if true, `Tween.removeTweens(target)` will be called to remove any other tweens with the same target.
	 *    <LI> paused: indicates whether to start the tween paused.</LI>
	 *    <LI> position: indicates the initial position for this tween.</LI>
	 *    <LI> onChange: specifies a listener for the "change" event.</LI>
	 * </UL>
	 * @param {Object} [pluginData] An object containing data for use by installed plugins. See individual
	 * plugins' documentation for details.
	 * @extends EventDispatcher
	 * @constructor
	 */
	function Tween(target, props, pluginData) {
	// public properties:
		/**
		 * Causes this tween to continue playing when a global pause is active. For example, if TweenJS is using {{#crossLink "Ticker"}}{{/crossLink}},
		 * then setting this to true (the default) will cause this tween to be paused when <code>Ticker.setPaused(true)</code>
		 * is called. See the Tween {{#crossLink "Tween/tick"}}{{/crossLink}} method for more info. Can be set via the props
		 * parameter.
		 * @property ignoreGlobalPause
		 * @type Boolean
		 * @default false
		 */
		this.ignoreGlobalPause = false;
	
		/**
		 * Indicates the number of times to loop. If set to -1, the tween will loop continuously.
		 * @property loop
		 * @type {Number}
		 * @default 0
		 */
		this.loop = 0;
	
		/**
		 * Specifies the total duration of this tween in milliseconds (or ticks if useTicks is true).
		 * This value is automatically updated as you modify the tween. Changing it directly could result in unexpected
		 * behaviour.
		 * @property duration
		 * @type {Number}
		 * @default 0
		 * @readonly
		 */
		this.duration = 0;
	
		/**
		 * Allows you to specify data that will be used by installed plugins. Each plugin uses this differently, but in general
		 * you specify data by setting it to a property of pluginData with the same name as the plugin class.
		 * @example
		 *	myTween.pluginData.PluginClassName = data;
		 * <br/>
		 * Also, most plugins support a property to enable or disable them. This is typically the plugin class name followed by "_enabled".<br/>
		 * @example
		 *	myTween.pluginData.PluginClassName_enabled = false;<br/>
		 * <br/>
		 * Some plugins also store instance data in this object, usually in a property named _PluginClassName.
		 * See the documentation for individual plugins for more details.
		 * @property pluginData
		 * @type {Object}
		 */
		this.pluginData = pluginData;
	
		/**
		 * The target of this tween. This is the object on which the tweened properties will be changed. Changing
		 * this property after the tween is created will not have any effect.
		 * @property target
		 * @type {Object}
		 * @readonly
		 */
		this.target = target;
	
		/**
		 * The current normalized position of the tween. This will always be a value between 0 and duration.
		 * Changing this property directly will have no effect.
		 * @property position
		 * @type {Object}
		 * @default 0
		 * @readonly
		 */
		this.position = 0;
		
		/**
		 * Raw position.
		 * @property rawPosition
		 * @type {Number}
		 * @default -1
		 * @readonly
		 */
		this.rawPosition = -1;
	
		/**
		 * Indicates the tween's current position is within a passive wait.
		 * @property passive
		 * @type {Boolean}
		 * @default false
		 * @readonly
		 **/
		this.passive = false;
	
		/**
		 * Uses ticks for all durations instead of milliseconds.
		 * @property useTicks
		 * @type {Boolean}
		 * @default false
		 * @readonly
		 */
		this.useTicks = false;
		
		/**
		 * Causes the tween to play in reverse.
		 * @property reversed
		 * @type {Boolean}
		 * @default false
		 */
		this.reversed = false;
		
		/**
		 * Causes the tween to reverse on each loop.
		 * @property bounce
		 * @type {Boolean}
		 * @default false
		 */
		this.bounce = false;
	
	// private properties:	
		/**
		 * @property _paused
		 * @type {Boolean}
		 * @default false
		 * @protected
		 */
		this._paused = false;
	
		/**
		 * @property _curProps
		 * @type {Object}
		 * @protected
		 */
		this._curProps = {};
	
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
		 * The position within the current step. Used by MovieClip.
		 * @property _stepPosition
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		this._stepPosition = 0;
	
		/**
		 * Previous position.
		 * @property _prevPos
		 * @type {Number}
		 * @default -1
		 * @protected
		 */
		this._prevPos = -1;
		
		/**
		 * Indicates whether the tween is currently registered with Tween.
		 * @property _registered
		 * @type {boolean}
		 * @default false
		 * @protected
		 */
		this._registered = false;
		
		this._next = this._prev = null;

		if (props) {
			this._useTicks = !!props.useTicks;
			this.ignoreGlobalPause = !!props.ignoreGlobalPause;
			this.loop = props.loop === true ? -1 : (props.loop||0);
			this.reversed = !!props.reversed;
			this.bounce = !!props.bounce;
			props.onChange && this.addEventListener("change", props.onChange);
			if (props.override) { Tween.removeTweens(target); }
		}
		if (props&&props.paused) { this._paused=true; }
		else { createjs.Tween._register(this,true); }
		if (props&&props.position!=null) { this.setPosition(props.position); } // TODO: test this - nothing is defined yet.
	};

	var p = createjs.extend(Tween, createjs.EventDispatcher);

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


// static methods	
	/**
	 * Returns a new tween instance. This is functionally identical to using "new Tween(...)", but looks cleaner
	 * with the chained syntax of TweenJS.
	 * <h4>Example</h4>
	 *
	 *		var tween = createjs.Tween.get(target);
	 *
	 * @method get
	 * @param {Object} target The target object that will have its properties tweened.
	 * @param {Object} [props] The configuration properties to apply to this tween instance (ex. `{loop:true, paused:true}`).
	 * All properties default to `false`. Supported props are:
	 * <UL>
	 *    <LI> loop: sets the loop property on this tween.</LI>
	 *    <LI> useTicks: uses ticks for all durations instead of milliseconds.</LI>
	 *    <LI> ignoreGlobalPause: sets the {{#crossLink "Tween/ignoreGlobalPause:property"}}{{/crossLink}} property on
	 *    this tween.</LI>
	 *    <LI> override: if true, `createjs.Tween.removeTweens(target)` will be called to remove any other tweens with
	 *    the same target.
	 *    <LI> paused: indicates whether to start the tween paused.</LI>
	 *    <LI> position: indicates the initial position for this tween.</LI>
	 *    <LI> onChange: specifies a listener for the {{#crossLink "Tween/change:event"}}{{/crossLink}} event.</LI>
	 * </UL>
	 * @param {Object} [pluginData] An object containing data for use by installed plugins. See individual plugins'
	 * documentation for details.
	 * @param {Boolean} [override=false] If true, any previous tweens on the same target will be removed. This is the
	 * same as calling `Tween.removeTweens(target)`.
	 * @return {Tween} A reference to the created tween. Additional chained tweens, method calls, or callbacks can be
	 * applied to the returned tween instance.
	 * @static
	 */
	Tween.get = function(target, props, pluginData, override) {
		if (override) { Tween.removeTweens(target); }
		return new Tween(target, props, pluginData);
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
		var tween = Tween._tweenHead; // to avoid race conditions.
		while (tween) {
			if ((paused && !tween.ignoreGlobalPause) || tween._paused) { continue; }
			tween.tick(tween._useTicks?1:delta);
			tween = tween._next;
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
		var tweens = Tween._tweens;
		for (var i=tweens.length-1; i>=0; i--) {
			var tween = tweens[i];
			if (tween.target === target) {
				tween._paused = true;
				tweens.splice(i, 1);
			}
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
		var tweens = Tween._tweens;
		for (var i= 0, l=tweens.length; i<l; i++) {
			var tween = tweens[i];
			tween._paused = true;
			tween.target&&(tween.target.tweenjs_count = 0);
		}
		tweens.length = 0;
	};

	/**
	 * Indicates whether there are any active tweens (and how many) on the target object (if specified) or in general.
	 * @method hasActiveTweens
	 * @param {Object} [target] The target to check for active tweens. If not specified, the return value will indicate
	 * if there are any active tweens on any target.
	 * @return {Boolean} If there are active tweens.
	 * @static
	 */
	Tween.hasActiveTweens = function(target) {
		if (target) { return target.tweenjs_count; }
		return !!Tween._tweenHead;
	};

	/**
	 * Installs a plugin, which can modify how certain properties are handled when tweened. See the {{#crossLink "CSSPlugin"}}{{/crossLink}}
	 * for an example of how to write TweenJS plugins.
	 * @method installPlugin
	 * @static
	 * @param {Object} plugin The plugin class to install
	 * @param {Array} properties An array of properties that the plugin will handle.
	 */
	Tween.installPlugin = function(plugin, properties) {
		var priority = plugin.priority, arr = Tween._plugins;
		if (priority == null) { plugin.priority = priority = 0; }
		if (!arr) { arr = Tween._plugins = []; }
		for (var j=0,jl=arr.length;j<jl;j++) {
			if (priority < arr[j].priority) { break; }
		}
		arr.splice(j,0,plugin);
	};

	/**
	 * Registers or unregisters a tween with the ticking system.
	 * @method _register
	 * @param {Tween} tween The tween instance to register or unregister.
	 * @param {Boolean} value If `true`, the tween is registered. If `false` the tween is unregistered.
	 * @static
	 * @protected
	 */
	Tween._register = function(tween, value) {
		var target = tween.target;
		if (value && !tween._registered) {
			// TODO: this approach might fail if a dev is using sealed objects in ES5
			if (target) { target.tweenjs_count = target.tweenjs_count ? target.tweenjs_count+1 : 1; }
			var tail = Tween._tweenTail;
			if (!tail) { Tween._tweenHead = Tween._tweenTail = tween; }
			else {
				Tween._tweenTail = tail._next = tween;
				tween._prev = tail;
			}
			if (!Tween._inited && createjs.Ticker) { createjs.Ticker.addEventListener("tick", Tween); Tween._inited = true; }
		} else if (!value && tween._registered) {
			if (target) { target.tweenjs_count--; }
			var next = tween._next, prev = tween._prev;
			
			if (!next) { Tween._tweenTail = prev; }
			else { next._prev = prev; }
			if (!prev) { Tween._tweenHead = next; }
			else { prev._next = next; }
		}
		tween._registered = value;
	};
	Tween._tweenHead = Tween.tweenTail = null;


// events:
	/**
	 * Called whenever the tween's position changes.
	 * @event change
	 * @since 0.4.0
	 **/
	

// public methods:
	/**
	 * Queues a wait (essentially an empty tween).
	 * <h4>Example</h4>
	 *
	 *		//This tween will wait 1s before alpha is faded to 0.
	 *		createjs.Tween.get(target).wait(1000).to({alpha:0}, 1000);
	 *
	 * @method wait
	 * @param {Number} duration The duration of the wait in milliseconds (or in ticks if `useTicks` is true).
	 * @param {Boolean} [passive] Tween properties will not be updated during a passive wait. This
	 * is mostly useful for use with {{#crossLink "Timeline"}}{{/crossLink}} instances that contain multiple tweens
	 * affecting the same target at different times.
	 * @return {Tween} This tween instance (for chaining calls).
	 **/
	p.wait = function(duration, passive) {
		if (duration == null || duration <= 0) { return this; }
		return this._addStep(duration, this._stepTail.props, null, passive);
	};

	/**
	 * Queues a tween from the current values to the target properties. Set duration to 0 to jump to these value.
	 * Numeric properties will be tweened from their current value in the tween to the target value. Non-numeric
	 * properties will be set at the end of the specified duration.
	 * <h4>Example</h4>
	 *
	 *		createjs.Tween.get(target).to({alpha:0}, 1000);
	 *
	 * @method to
	 * @param {Object} props An object specifying property target values for this tween (Ex. `{x:300}` would tween the x
	 * property of the target to 300).
	 * @param {Number} [duration=0] The duration of the wait in milliseconds (or in ticks if `useTicks` is true).
	 * @param {Function} [ease="linear"] The easing function to use for this tween. See the {{#crossLink "Ease"}}{{/crossLink}}
	 * class for a list of built-in ease functions.
	 * @return {Tween} This tween instance (for chaining calls).
	 */
	p.to = function(props, duration, ease) {
		if (isNaN(duration) || duration < 0) { duration = 0; }
		return this._addStep(duration, this._cloneProps(this._appendProps(props)), ease);
	};

	/**
	 * Queues an action to call the specified function.
	 * <h4>Example</h4>
	 *
	 *   	//would call myFunction() after 1 second.
	 *   	myTween.wait(1000).call(myFunction);
	 *
	 * @method call
	 * @param {Function} callback The function to call.
	 * @param {Array} [params]. The parameters to call the function with. If this is omitted, then the function
	 *      will be called with a single param pointing to this tween.
	 * @param {Object} [scope]. The scope to call the function in. If omitted, it will be called in the target's
	 *      scope.
	 * @return {Tween} This tween instance (for chaining calls).
	 */
	p.call = function(callback, params, scope) {
		return this._addAction(scope||this.target, callback, params||[this]);
	};

	// TODO: add clarification between this and a 0 duration .to:
	/**
	 * Queues an action to set the specified props on the specified target. If target is null, it will use this tween's
	 * target.
	 * <h4>Example</h4>
	 *
	 *		myTween.wait(1000).set({visible:false},foo);
	 *
	 * @method set
	 * @param {Object} props The properties to set (ex. `{visible:false}`).
	 * @param {Object} [target] The target to set the properties on. If omitted, they will be set on the tween's target.
	 * @return {Tween} This tween instance (for chaining calls).
	 */
	p.set = function(props, target) {
		return this._addAction(target||this.target, this._set, props);
	};

	/**
	 * Queues an action to play (unpause) the specified tween. This enables you to sequence multiple tweens.
	 * <h4>Example</h4>
	 *
	 *		myTween.to({x:100},500).play(otherTween);
	 *
	 * @method play
	 * @param {Tween} tween The tween to play.
	 * @return {Tween} This tween instance (for chaining calls).
	 */
	p.play = function(tween) {
		return this.call(this.setPaused, [false], tween||this);
	};

	/**
	 * Queues an action to pause the specified tween.
	 * @method pause
	 * @param {Tween} tween The tween to play. If null, it pauses this tween.
	 * @return {Tween} This tween instance (for chaining calls)
	 */
	p.pause = function(tween) {
		return this.call(this.setPaused, [true], tween||this);
	};
	
	// TODO: doc
	p.advance = function(delta, ignoreActions) {
		this.setPosition(this.rawPosition+delta, !ignoreActions);
	};
		
	/**
	 * Advances the tween to a specified position.
	 * @method setPosition
	 * @param {Number} value The position to seek to in milliseconds (or ticks if useTicks is true).
	 * @param {Number} [runActions=false] If true, all actions between the previous and new position will be run (except when useTicks is true, in which case only the actions on the new position will be run).
	 * @return {Boolean} Returns `true` if the tween is complete (ie. the full tween has run & {{#crossLink "Tween/loop:property"}}{{/crossLink}}
	 * is `false`).
	 */
	p.setPosition = function(value, runActions) {
		var d=this.duration, prevPos=this._prevPos, loopCount=this.loop, step, stepNext;
		
		// normalize position:
		var loop = value/d|0;
		var t = value%d;
		
		var end = (loop > loopCount && loopCount !== -1);
		if (end) { value = (t=d)*(loop=loopCount)+d; }
		
		if (value === prevPos) { return end; }
		
		var rev = !this.reversed !== !(this.bounce && loop%2); // current loop is reversed
		if (rev) { t = d-t; }
		
		// handle tweens:
		if (this.target && (step = this._stepHead.next)) {
			// find our new step index:
			stepNext = step.next;
			while (stepNext && stepNext.t <= t) { step = step.next; stepNext = step.next; }
			var ratio = end ? t/d : (this._stepPosition = t-step.t)/step.d;
			this._updateTargetProps(step,ratio,end);
		}
		
		if (end) { this.setPaused(true); }
		
		// set this in advance in case an action modifies position:
		this._prevPos = this.rawPosition;
		this.position = t;
		this.rawPosition = value;
		
		if (runActions) { this._runActions(); }

		this.dispatchEvent("change");
		return end;
	};
	
	// TODO: doc
	p._runActions = function() {
		// runs actions between _prevPos & position. Separated for use by MovieClip.
		if (!this._actionHead) { return; }
		var d=this.duration, reversed=this.reversed, bounce=this.bounce, loopCount=this.loop;
		
		var pos0=this._prevPos, pos1=this.rawPosition;
		if (pos0 === pos1) { return; }
		var loop0=pos0/d|0, loop1=pos1/d| 0, loop=loop0;
		var t0=pos0%d, t1=pos1%d;
		if (loop1 > loopCount && loopCount !== -1) { t1=d; loop1=loopCount; }
		
		if (this._useTicks) {
			// only run the actions we landed on.
			return this._runActionsRange(t1, t1, false);
		}
		
		do {
			var rev = !reversed !== !(bounce && loop%2);
			var start = (loop === loop0) ? t0 : 0;
			var end = (loop === loop1) ? t1 : d;
			if (rev) {
				start = d-start;
				end = d-end;
			}
			this._runActionsRange(start, end, loop !== loop0 && !bounce);
		} while (++loop <= loop1);
	};

	/**
	 * Advances this tween by the specified amount of time in milliseconds (or ticks if `useTicks` is `true`).
	 * This is normally called automatically by the Tween engine (via {{#crossLink "Tween/tick"}}{{/crossLink}}), but is
	 * exposed for advanced uses.
	 * @method tick
	 * @param {Number} delta The time to advance in milliseconds (or ticks if `useTicks` is `true`).
	 */
	p.tick = function(delta) {
		if (!this._paused) { this.advance(delta); }
	};

	/**
	 * Pauses or plays this tween.
	 * @method setPaused
	 * @param {Boolean} [value=true] Indicates whether the tween should be paused (`true`) or played (`false`).
	 * @return {Tween} This tween instance (for chaining calls)
	 */
	p.setPaused = function(value) { // TODO: should this be a getter/setter?
		if (this._paused === !!value) { return this; }
		this._paused = !!value;
		Tween._register(this, !value);
		return this;
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
	 * @method _updateTargetProps
	 * @param {Object} step
	 * @param {Number} ratio
	 * @param {Boolean} end Indicates to plugins that the full tween has ended.
	 * @protected
	 */
	p._updateTargetProps = function(step, ratio, end) {
		if (this.passive = !!step.passive) { return; }; // don't update props.
		
		var p0,p1,v,v0,v1;
		p0 = step.prev.props;
		p1 = step.props;
		if (step.ease) { ratio = step.ease(ratio,0,1,1); }
		
		var initProps=this._stepHead.props, plugins = Tween._plugins;
		for (var n in initProps) {
			if ((v0 = p0[n]) === undefined) { p0[n] = v0 = initProps[n]; }
			if ((v1 = p1[n]) === undefined) { p1[n] = v1 = v0; }
			if (ratio === 1) { v= v1; } // at end
			else if (v0 === v1 || ratio === 0 || (typeof(v0) !== "number")) {
				// no interpolation - at start, values didn't change, or the value is non-numeric.
				v = v0;
			} else {
				v = v0+(v1-v0)*ratio;
			}
			
			var ignore = false;
			
			if (plugins) {
				for (var i=0,l=plugins.length;i<l;i++) {
					var v2 = plugins[i].tween(this, n, v, p0, p1, ratio, p0===p1, end);
					if (v2 === Tween.IGNORE) { ignore = true; }
					else { v = v2; }
				}
			}
			
			if (!ignore) { this.target[n] = v; }
			
		}

	};

	/**
	 * @method _runActions
	 * @param {Number} startPos
	 * @param {Number} endPos
	 * @param {Boolean} includeStart
	 * @protected
	 */
	p._runActionsRange = function(startPos, endPos, includeStart) {
		var rev = startPos > endPos;
		var action = rev ? this._actionTail : this._actionHead;
		var ePos = endPos, sPos = startPos;
		if (rev) { ePos=startPos; sPos=endPos; }
		while (action) {
			var pos = action.t;
			if (pos === endPos || (pos > sPos && pos < ePos) || (includeStart && pos === startPos)) {
				action.funct.apply(action.scope, action.params);
			}
			action = rev ? action.prev : action.next;
		}
	};

	/**
	 * @method _appendProps
	 * @param {Object} props
	 * @protected
	 */
	p._appendProps = function(props) {
		var initProps = this._stepHead.props, curProps = this._curProps, target = this.target, plugins = Tween._plugins;
		var n, i, l, value, oldValue, inject, ignored;
		
		for (n in props) {
			if (initProps[n] === undefined) {
				oldValue = undefined; // accessing missing properties on DOMElements when using CSSPlugin is INSANELY expensive.
				
				if (plugins) {
					for (i = 0, l = plugins.length; i < l; i++) {
						if ((oldValue = plugins[i].init(this, n, oldValue)) === Tween.IGNORE) {
							(ignored = ignored || {})[n] = true;
							break;
						};
					}
				}
				if (oldValue !== Tween.IGNORE) {
					if (oldValue === undefined) { oldValue = target[n]; }
					initProps[n] = curProps[n] = (oldValue === undefined) ? null : oldValue;
				}
			}
		}
		
		for (n in props) {
			if (ignored && ignored[n]) { continue; }
			value = props[n];
			oldValue = curProps[n];
			if (plugins) {
				for (i = 0, l = plugins.length; i < l; i++) {
					inject = plugins[i].step(this, n, oldValue, value, inject) || inject;
				}
			}
			curProps[n] = value;
		}
		if (inject) { this._appendProps(inject); }
		
		return curProps;
	};

	/**
	 * @method _cloneProps
	 * @param {Object} props
	 * @protected
	 */
	p._cloneProps = function(props) {
		var o = {};
		for (var n in props) {
			o[n] = props[n];
		}
		return o;
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
		this._stepTail = this._stepTail.next = step;
		return this;
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

	createjs.Tween = createjs.promote(Tween, "EventDispatcher");
	
	
	function TweenStep(prev, t, d, props, ease, passive) {
		this.next = null;
		this.prev = prev;
		this.t = t;
		this.d = d;
		this.props = props;
		this.ease = ease;
		this.passive = passive;
		this.pluginData = null;
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
