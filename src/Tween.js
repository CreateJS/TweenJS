/**
 * @license Tween
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2017 gskinner.com, inc.
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

import AbstractTween from "./AbstractTween";
import { linear } from "./Ease";
import Ticker from "@createjs/core/src/utils/Ticker";

/**
 * Tweens properties for a single target. Methods can be chained to create complex animation sequences:
 *
 * @example
 * Tween.get(target)
 *   .wait(500)
 *   .to({ alpha: 0, visible: false }, 1000)
 *   .call(handleComplete);
 *
 * Multiple tweens can share a target, however if they affect the same properties there could be unexpected
 * behaviour. To stop all tweens on an object, use {@link tweenjs.Tween#removeTweens} or pass `override:true`
 * in the props argument.
 *
 * 	createjs.Tween.get(target, {override:true}).to({x:100});
 *
 * Subscribe to the {@link tweenjs.Tween#event:change} event to be notified when the tween position changes.
 *
 * 	createjs.Tween.get(target, {override:true}).to({x:100}).addEventListener("change", handleChange);
 * 	function handleChange(event) {
 * 		// The tween changed.
 * 	}
 *
 * @see {@link tweenjs.Tween.get}
 *
 * @memberof tweenjs
 * @extends tweenjs.AbstractTween
 *
 * @param {Object} target The target object that will have its properties tweened.
 * @param {Object} [props] The configuration properties to apply to this instance (ex. `{loop:-1, paused:true}`).
 * @param {Boolean} [props.useTicks]
 * @param {Boolean} [props.ignoreGlobalPause]
 * @param {Number|Boolean} [props.loop]
 * @param {Boolean} [props.reversed]
 * @param {Boolean} [props.bounce]
 * @param {Number} [props.timeScale]
 * @param {Object} [props.pluginData]
 * @param {Boolean} [props.paused]
 * @param {*} [props.position] indicates the initial position for this tween
 * @param {*} [props.onChange] adds the specified function as a listener to the `change` event
 * @param {*} [props.onComplete] adds the specified function as a listener to the `complete` event
 * @param {*} [props.override] if true, removes all existing tweens for the target
 */
export default class Tween extends AbstractTween {

	constructor (target, props) {
		super(props);

		/**
		 * Allows you to specify data that will be used by installed plugins. Each plugin uses this differently, but in general
		 * you specify data by assigning it to a property of `pluginData` with the same name as the plugin.
		 * Note that in many cases, this data is used as soon as the plugin initializes itself for the tween.
		 * As such, this data should be set before the first `to` call in most cases.
		 *
		 * Some plugins also store working data in this object, usually in a property named `_PluginClassName`.
		 * See the documentation for individual plugins for more details.
		 *
		 * @example
		 * myTween.pluginData.SmartRotation = data;
		 * myTween.pluginData.SmartRotation_disabled = true;
		 *
		 *
		 * @default null
		 * @type {Object}
		 */
		this.pluginData = null;

		/**
		 * The target of this tween. This is the object on which the tweened properties will be changed.
		 * @type {Object}
		 * @readonly
		 */
		this.target = target;

		/**
		 * Indicates the tween's current position is within a passive wait.
		 * @type {Boolean}
		 * @default false
		 * @readonly
		 */
		this.passive = false;

		/**
		 * @private
		 * @type {TweenStep}
		 */
		this._stepHead = new TweenStep(null, 0, 0, {}, null, true);

		/**
		 * @private
		 * @type {TweenStep}
		 */
		this._stepTail = this._stepHead;

		/**
		 * The position within the current step. Used by MovieClip.
		 * @private
		 * @type {Number}
		 * @default 0
		 */
		this._stepPosition = 0;

		/**
		 * @private
		 * @type {TweenAction}
		 * @default null
		 */
		this._actionHead = null;

		/**
		 * @private
		 * @type {TweenAction}
		 * @default null
		 */
		this._actionTail = null;

		/**
		 * Plugins added to this tween instance.
		 * @private
		 * @type {Object[]}
		 * @default null
		 */
		this._plugins = null;

		/**
		 * Hash for quickly looking up added plugins. Null until a plugin is added.
		 * @private
		 * @type {Object}
		 * @default null
		 */
		this._pluginIds = null;


		/**
		 * Used by plugins to inject new properties.
		 * @private
		 * @type {Object}
		 * @default null
		 */
		this._injected = null;

		if (props) {
			this.pluginData = props.pluginData;
			if (props.override) { Tween.removeTweens(target); }
		}
		if (!this.pluginData) { this.pluginData = {}; }

		this._init(props);
	}

	/**
	 * Returns a new tween instance. This is functionally identical to using `new Tween(...)`, but may look cleaner
	 * with the chained syntax of TweenJS.
	 *
	 * @static
	 * @example
	 * let tween = Tween.get(target).to({ x: 100 }, 500);
	 * // equivalent to:
	 * let tween = new Tween(target).to({ x: 100 }, 500);
	 *
	 * @param {Object} target The target object that will have its properties tweened.
	 * @param {Object} [props] The configuration properties to apply to this instance (ex. `{loop:-1, paused:true}`).
	 * @param {Boolean} [props.useTicks]
	 * @param {Boolean} [props.ignoreGlobalPause]
	 * @param {Number|Boolean} [props.loop]
	 * @param {Boolean} [props.reversed]
	 * @param {Boolean} [props.bounce]
	 * @param {Number} [props.timeScale]
	 * @param {Object} [props.pluginData]
	 * @param {Boolean} [props.paused]
	 * @param {*} [props.position] indicates the initial position for this tween
	 * @param {*} [props.onChange] adds the specified function as a listener to the `change` event
	 * @param {*} [props.onComplete] adds the specified function as a listener to the `complete` event
	 * @param {*} [props.override] if true, removes all existing tweens for the target
	 * @return {Tween} A reference to the created tween.
	 */
	static get (target, props) {
		return new Tween(target, props);
	}

	/**
	 * Advances all tweens. This typically uses the {{#crossLink "Ticker"}}{{/crossLink}} class, but you can call it
	 * manually if you prefer to use your own "heartbeat" implementation.
	 *
	 * @static
	 *
	 * @param {Number} delta The change in time in milliseconds since the last tick. Required unless all tweens have
	 * `useTicks` set to true.
	 * @param {Boolean} paused Indicates whether a global pause is in effect. Tweens with {@link tweenjs.Tween#ignoreGlobalPause}
	 * will ignore this, but all others will pause if this is `true`.
	 */
	static tick (delta, paused) {
		let tween = Tween._tweenHead;
		const t = Tween._inTick = Date.now();
		while (tween) {
			let next = tween._next, status=tween._status;
			tween._lastTick = t;
			if (status === 1) { tween._status = 0; } // new, ignore
			else if (status === -1) { Tween._delist(tween); } // removed, delist
			else if ((paused && !tween.ignoreGlobalPause) || tween._paused) { /* paused */ }
			else { tween.advance(tween.useTicks ? 1 : delta); }
			tween = next;
		}
		Tween._inTick = 0;
	}

	/**
	 * Handle events that result from Tween being used as an event handler. This is included to allow Tween to handle
	 * {@link tweenjs.Ticker#event:tick} events from the {@link tweenjs.Ticker}.
	 * No other events are handled in Tween.
	 *
	 * @static
	 * @since 0.4.2
	 *
	 * @param {Object} event An event object passed in by the {@link core.EventDispatcher}. Will
	 * usually be of type "tick".
	 */
	static handleEvent (event) {
		if (event.type === "tick") {
			this.tick(event.delta, event.paused);
		}
	}

	/**
	 * Removes all existing tweens for a target. This is called automatically by new tweens if the `override`
	 * property is `true`.
	 *
	 * @static
	 *
	 * @param {Object} target The target object to remove existing tweens from.=
	 */
	static removeTweens (target) {
		if (!target.tweenjs_count) { return; }
		let tween = Tween._tweenHead;
		while (tween) {
			let next = tween._next;
			if (tween.target === target) { tween.paused = true; }
			tween = next;
		}
		target.tweenjs_count = 0;
	}

	/**
	 * Stop and remove all existing tweens.
	 *
	 * @static
	 * @since 0.4.1
	 */
	static removeAllTweens () {
		let tween = Tween._tweenHead;
		while (tween) {
			let next = tween._next;
			tween._paused = true;
			tween.target && (tween.target.tweenjs_count = 0);
			tween._next = tween._prev = null;
			tween = next;
		}
		Tween._tweenHead = Tween._tweenTail = null;
	}

	/**
	 * Indicates whether there are any active tweens on the target object (if specified) or in general.
	 *
	 * @static
	 *
	 * @param {Object} [target] The target to check for active tweens. If not specified, the return value will indicate
	 * if there are any active tweens on any target.
	 * @return {Boolean} Indicates if there are active tweens.
	 */
	static hasActiveTweens (target) {
		if (target) { return !!target.tweenjs_count; }
		return !!Tween._tweenHead;
	}

	/**
	 * Installs a plugin, which can modify how certain properties are handled when tweened. See the {{#crossLink "SamplePlugin"}}{{/crossLink}}
	 * for an example of how to write TweenJS plugins. Plugins should generally be installed via their own `install` method, in order to provide
	 * the plugin with an opportunity to configure itself.
	 *
	 * @static
	 *
	 * @param {Object} plugin The plugin to install
	 * @param {Object} props The props to pass to the plugin
	 */
	static installPlugin (plugin, props) {
		plugin.install(props);
		const priority = (plugin.priority = plugin.priority || 0), arr = (Tween._plugins = Tween._plugins || []);
		for (let i = 0, l = arr.length; i < l; i++) {
			if (priority < arr[i].priority) { break; }
		}
		arr.splice(i, 0, plugin);
	}

	/**
	 * Registers or unregisters a tween with the ticking system.
	 *
	 * @private
	 * @static
	 *
	 * @param {Tween} tween The tween instance to register or unregister.
	 * @param {Boolean} paused If `false`, the tween is registered. If `true` the tween is unregistered.
	 */
	static _register (tween, paused) {
		const target = tween.target;
		if (!paused && tween._paused) {
			// TODO: this approach might fail if a dev is using sealed objects
			if (target) { target.tweenjs_count = target.tweenjs_count ? target.tweenjs_count + 1 : 1; }
			let tail = Tween._tweenTail;
			if (!tail) { Tween._tweenHead = Tween._tweenTail = tween; }
			else {
				Tween._tweenTail = tail._next = tween;
				tween._prev = tail;
			}
			tween._status = Tween._inTick ? 1 : 0;
			if (!Tween._inited) { Ticker.addEventListener("tick", Tween); Tween._inited = true; }
		} else if (paused && !tween._paused) {
			if (target) { target.tweenjs_count--; }
			// tick handles delist if we're in a tick stack and the tween hasn't advanced yet:
			if (!Tween._inTick || tween._lastTick === Tween._inTick) { Tween._delist(tween); }
			tween._status = -1;
		}
		tween._paused = paused;
	}

	/**
	 * @param {tweenjs.Tween} tween
	 */
	static _delist(tween) {
		let next = tween._next,
				prev = tween._prev;
		if (next) { next._prev = prev; }
		else { Tween._tweenTail = prev; } // was tail
		if (prev) { prev._next = next; }
		else { Tween._tweenHead = next; } // was head.
		tween._next = tween._prev = null;
	}

	/**
	 * Adds a wait (essentially an empty tween).
	 *
	 * @example
	 * // This tween will wait 1s before alpha is faded to 0.
	 * Tween.get(target)
	 *   .wait(1000)
	 *   .to({ alpha: 0 }, 1000);
	 *
	 * @param {Number} duration The duration of the wait in milliseconds (or in ticks if `useTicks` is true).
	 * @param {Boolean} [passive=false] Tween properties will not be updated during a passive wait. This
	 * is mostly useful for use with {@link tweenjs.Timeline} instances that contain multiple tweens
	 * affecting the same target at different times.
	 * @chainable
	 */
	wait (duration, passive = false) {
		if (duration > 0) { this._addStep(+duration, this._stepTail.props, null, passive); }
		return this;
	}

	/**
	 * Adds a tween from the current values to the specified properties. Set duration to 0 to jump to these value.
	 * Numeric properties will be tweened from their current value in the tween to the target value. Non-numeric
	 * properties will be set at the end of the specified duration.
	 *
	 * @example
	 * Tween.get(target)
	 *   .to({ alpha: 0, visible: false }, 1000);
	 *
	 * @param {Object} props An object specifying property target values for this tween (Ex. `{x:300}` would tween the x
	 * property of the target to 300).
	 * @param {Number} [duration=0] The duration of the tween in milliseconds (or in ticks if `useTicks` is true).
	 * @param {Function} [ease=Ease.linear] The easing function to use for this tween. See the {@link tweenjs.Ease}
	 * class for a list of built-in ease functions.
	 * @chainable
	 */
	to (props, duration = 0, ease = linear) {
		if (duration < 0) { duration = 0; }
		const step = this._addStep(+duration, null, ease);
		this._appendProps(props, step);
		return this;
	}

	/**
	 * Adds a label that can be used with {@link tweenjs.Tween#gotoAndPlay}/{@link tweenjs.Tween#gotoAndStop}
	 * at the current point in the tween.
	 *
	 * @example
	 * let tween = Tween.get(foo)
	 *   .to({ x: 100 }, 1000)
	 *   .label("myLabel")
	 *   .to({ x: 200 }, 1000);
	 * // ...
	 * tween.gotoAndPlay("myLabel"); // would play from 1000ms in.
	 *
	 * @param {String} label The label name.
	 * @chainable
	 */
	label (name) {
		this.addLabel(name, this.duration);
		return this;
	}

	/**
	 * Adds an action to call the specified function.
	 *
	 * @example
	 * // would call myFunction() after 1 second.
	 * Tween.get()
	 *   .wait(1000)
	 *   .call(myFunction);
	 *
	 * @param {Function} callback The function to call.
	 * @param {Array} [params]. The parameters to call the function with. If this is omitted, then the function
	 * will be called with a single param pointing to this tween.
	 * @param {Object} [scope]. The scope to call the function in. If omitted, it will be called in the target's scope.
	 * @chainable
	 */
	call (callback, params, scope) {
		return this._addAction(scope || this.target, callback, params || [this]);
	}

	/**
	 * Adds an action to set the specified props on the specified target. If `target` is null, it will use this tween's
	 * target. Note that for properties on the target object, you should consider using a zero duration {@link tweenjs.Tween#to}
	 * operation instead so the values are registered as tweened props.
	 *
	 * @example
	 * tween.wait(1000)
	 *   .set({ visible: false }, foo);
	 *
	 * @param {Object} props The properties to set (ex. `{ visible: false }`).
	 * @param {Object} [target] The target to set the properties on. If omitted, they will be set on the tween's target.
	 * @chainable
	 */
	set (props, target) {
		return this._addAction(target || this.target, this._set, [ props ]);
	}

	/**
	 * Adds an action to play (unpause) the specified tween. This enables you to sequence multiple tweens.
	 *
	 * @example
	 * tween.to({ x: 100 }, 500)
	 *   .play(otherTween);
	 *
	 * @param {Tween} [tween] The tween to play. Defaults to this tween.
	 * @chainable
	 */
	play (tween) {
    return this._addAction(tween || this, this._set, [{ paused: false }]);
	}

	/**
	 * Adds an action to pause the specified tween.
	 * At 60fps the tween will advance by ~16ms per tick, if the tween above was at 999ms prior to the current tick, it
   * will advance to 1015ms (15ms into the second "step") and then pause.
	 *
	 * @example
	 * tween.pause(otherTween)
	 *   .to({ alpha: 1 }, 1000)
	 *   .play(otherTween);
	 *
	 * // Note that this executes at the end of a tween update,
	 * // so the tween may advance beyond the time the pause action was inserted at.
   *
   * tween.to({ foo: 0 }, 1000)
   *   .pause()
   *   .to({ foo: 1 }, 1000);
	 *
	 * @param {Tween} [tween] The tween to pause. Defaults to this tween.
	 * @chainable
	 */
	pause (tween) {
		return this._addAction(tween || this, this._set, [{ paused: false }]);
	}

	/**
	 * @throws Tween cannot be cloned.
	 */
	clone () {
		throw "Tween can not be cloned.";
	}

	/**
	 * @private
	 * @param {Object} plugin
	 */
	_addPlugin (plugin) {
		let ids = this._pluginIds || (this._pluginIds = {}), id = plugin.id;
		if (!id || ids[id]) { return; } // already added

		ids[id] = true;
		let plugins = this._plugins || (this._plugins = []), priority = plugin.priority || 0;
		for (let i = 0, l = plugins.length; i < l; i++) {
			if (priority < plugins[i].priority) {
				plugins.splice(i, 0, plugin);
				return;
			}
		}
		plugins.push(plugin);
	}

	/**
	 * @private
	 * @param {} jump
	 * @param {Boolean} end
   */
	_updatePosition (jump, end) {
		let step = this._stepHead.next, t = this.position, d = this.duration;
		if (this.target && step) {
			// find our new step index:
			let stepNext = step.next;
			while (stepNext && stepNext.t <= t) { step = step.next; stepNext = step.next; }
			let ratio = end ? d === 0 ? 1 : t/d : (t-step.t)/step.d; // TODO: revisit this.
			this._updateTargetProps(step, ratio, end);
		}
		this._stepPosition = step ? t - step.t : 0;
	}

	/**
	 * @private
	 * @param {Object} step
	 * @param {Number} ratio
	 * @param {Boolean} end Indicates to plugins that the full tween has ended.
	 */
	_updateTargetProps (step, ratio, end) {
		if (this.passive = !!step.passive) { return; } // don't update props.

		let v, v0, v1, ease;
		let p0 = step.prev.props;
		let p1 = step.props;
		if (ease = step.ease) { ratio = ease(ratio, 0, 1, 1); }

		let plugins = this._plugins;
		proploop : for (let n in p0) {
			v0 = p0[n];
			v1 = p1[n];

			// values are different & it is numeric then interpolate:
			if (v0 !== v1 && (typeof(v0) === "number")) {
				v = v0 + (v1 - v0) * ratio;
			} else {
				v = ratio >= 1 ? v1 : v0;
			}

			if (plugins) {
				for (let i = 0, l = plugins.length; i < l; i++) {
					let value = plugins[i].change(this, step, n, v, ratio, end);
					if (value === Tween.IGNORE) { continue proploop; }
					if (value !== undefined) { v = value; }
				}
			}
			this.target[n] = v;
		}

	}

	/**
	 * @private
	 * @param {Number} startPos
	 * @param {Number} endPos
	 * @param {Boolean} includeStart
	 */
	_runActionsRange (startPos, endPos, jump, includeStart) {
		let rev = startPos > endPos;
		let action = rev ? this._actionTail : this._actionHead;
		let ePos = endPos, sPos = startPos;
		if (rev) { ePos = startPos; sPos = endPos; }
		let t = this.position;
		while (action) {
			let pos = action.t;
			if (pos === endPos || (pos > sPos && pos < ePos) || (includeStart && pos === startPos)) {
				action.funct.apply(action.scope, action.params);
				if (t !== this.position) { return true; }
			}
			action = rev ? action.prev : action.next;
		}
	}

	/**
	 * @private
	 * @param {Object} props
	 */
	_appendProps (props, step, stepPlugins) {
		let initProps = this._stepHead.props, target = this.target, plugins = Tween._plugins;
		let n, i, l, value, initValue, inject;

		let oldStep = step.prev, oldProps = oldStep.props;
		let stepProps = step.props || (step.props = this._cloneProps(oldProps));
		let cleanProps = {};

		for (n in props) {
			if (!props.hasOwnProperty(n)) { continue; }
			cleanProps[n] = stepProps[n] = props[n];

			if (initProps[n] !== undefined) { continue; }

			initValue = undefined; // accessing missing properties on DOMElements when using CSSPlugin is INSANELY expensive, so we let the plugin take a first swing at it.
			if (plugins) {
        for (i = plugins.length - 1; i >= 0; i--) {
					value = plugins[i].init(this, n, initValue);
					if (value !== undefined) { initValue = value; }
					if (initValue === Tween.IGNORE) {
						(ignored = ignored || {})[n] = true;
						delete(stepProps[n]);
						delete(cleanProps[n]);
						break;
					}
				}
			}

			if (initValue !== Tween.IGNORE) {
				if (initValue === undefined) { initValue = target[n]; }
				oldProps[n] = (initValue === undefined) ? null : initValue;
			}
		}

		for (n in cleanProps) {
			value = props[n];

			// propagate old value to previous steps:
			let o, prev = oldStep;
			while ((o = prev) && (prev = o.prev)) {
				if (prev.props === o.props) { continue; } // wait step
				if (prev.props[n] !== undefined) { break; } // already has a value, we're done.
				prev.props[n] = oldProps[n];
			}
		}

		if (stepPlugins && (plugins = this._plugins)) {
      for (i = plugins.length - 1; i >= 0; i--) {
				plugins[i].step(this, step, cleanProps);
			}
		}

		if (inject = this._injected) {
			this._injected = null;
			this._appendProps(inject, step, false);
		}
	}

	/**
	 * Used by plugins to inject properties onto the current step. Called from within `Plugin.step` calls.
	 * For example, a plugin dealing with color, could read a hex color, and inject red, green, and blue props into the tween.
	 * See the SamplePlugin for more info.
	 * @see tweenjs.SamplePlugin
	 * @private
	 * @param {String} name
	 * @param {Object} value
	 */
	_injectProp (name, value) {
		let o = this._injected || (this._injected = {});
		o[name] = value;
	}

	/**
	 * @private
	 * @param {Number} duration
	 * @param {Object} props
	 * @param {Function} ease
	 * @param {Boolean} [passive=false]
	 */
	_addStep (duration, props, ease, passive = false) {
		let step = new TweenStep(this._stepTail, this.duration, duration, props, ease, passive);
		this.duration += duration;
		return this._stepTail = (this._stepTail.next = step);
	}

	/**
	 * @private
	 * @param {Object} scope
	 * @param {Function} funct
	 * @param {Array} params
	 */
	_addAction (scope, funct, params) {
		let action = new TweenAction(this._actionTail, this.duration, scope, funct, params);
		if (this._actionTail) { this._actionTail.next = action; }
		else { this._actionHead = action; }
		this._actionTail = action;
		return this;
	}

	/**
	 * @private
	 * @param {Object} props
	 */
	_set (props) {
		for (let n in props) {
			this[n] = props[n];
		}
	}

	/**
	 * @private
	 * @param {Object} props
	 */
	_cloneProps (props) {
		let o = {};
		for (let n in props) { o[n] = props[n]; }
		return o;
	}

}

// tiny api (primarily for tool output):
{
	let p = Tween.prototype;
	p.w = p.wait;
	p.t = p.to;
	p.c = p.call;
	p.s = p.set;
}

// static properties
/**
 * Constant returned by plugins to tell the tween not to use default assignment.
 * @property IGNORE
 * @type {Object}
 * @static
 */
Tween.IGNORE = {};

/**
 * @property _listeners
 * @type {Tween[]}
 * @static
 * @private
 */
Tween._tweens = [];

/**
 * @property _plugins
 * @type {Object}
 * @static
 * @private
 */
Tween._plugins = null;

/**
 * @property _tweenHead
 * @type {Tween}
 * @static
 * @private
 */
Tween._tweenHead = null;

/**
 * @property _tweenTail
 * @type {Tween}
 * @static
 * @private
 */
Tween._tweenTail = null;

/**
 * 0 if not in tick, otherwise a tick ID (currently just a timestamp).
 * @property _inTick
 * @type {Number}
 * @static
 * @protected
 */
Tween._inTick = 0;


// helpers:

/**
 * @private
 * @param {*} prev
 * @param {*} t
 * @param {*} d
 * @param {*} props
 * @param {*} ease
 * @param {*} passive
 */
class TweenStep {

	constructor (prev, t, d, props, ease, passive) {
		this.next = null;
		this.prev = prev;
		this.t = t;
		this.d = d;
		this.props = props;
		this.ease = ease;
		this.passive = passive;
		this.index = prev ? prev.index + 1 : 0;
	}

}

/**
 * @private
 * @param {*} prev
 * @param {*} t
 * @param {*} scope
 * @param {*} funct
 * @param {*} params
 */
class TweenAction {

	constructor (prev, t, scope, funct, params) {
		this.next = null;
		this.d = 0;
		this.prev = prev;
		this.t = t;
		this.scope = scope;
		this.funct = funct;
		this.params = params;
	}

}
