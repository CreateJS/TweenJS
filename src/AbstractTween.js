/*
* TweenJS
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

import EventDispatcher from "createjs/src/events/EventDispatcher";
import Tween from "./Tween";

/**
 * Base class that both {{#crossLink "Tween"}}{{/crossLink}} and {{#crossLink "Timeline"}}{{/crossLink}} extend. Should not be instantiated directly.
 * @class AbstractTween
 * @param {Object} [props]
 * @extends EventDispatcher
 * @module TweenJS
 * @constructor
 */
export default class AbstractTween extends EventDispatcher {

// constructor:
  /**
   * @constructor
   * @param {Object} [props]
   */
  constructor (props) {
    super();

  // public properties:
		/**
		 * Causes this tween to continue playing when a global pause is active. For example, if TweenJS is using {{#crossLink "Ticker"}}{{/crossLink}},
		 * then setting this to false (the default) will cause this tween to be paused when `Ticker.setPaused(true)`
		 * is called. See the {{#crossLink "Tween/tick"}}{{/crossLink}} method for more info. Can be set via the `props`
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
		 * Uses ticks for all durations instead of milliseconds. This also changes the behaviour of some actions (such as `call`).
		 * Changing this value on a running tween could have unexpected results.
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
		 * Causes the tween to reverse direction at the end of each loop.
		 * @property bounce
		 * @type {Boolean}
		 * @default false
		 */
		this.bounce = false;

		/**
		 * Changes the rate at which the tween advances. For example, a `timeScale` value of `2` will double the
		 * playback speed, a value of `0.5` would halve it.
		 * @property timeScale
		 * @type {Number}
		 * @default 1
		 */
		this.timeScale = 1;

		/**
		 * Indicates the duration of this tween in milliseconds (or ticks if `useTicks` is true), irrespective of `loops`.
		 * This value is automatically updated as you modify the tween. Changing it directly could result in unexpected
		 * behaviour.
		 * @property duration
		 * @type {Number}
		 * @default 0
		 * @readonly
		 */
		this.duration = 0;

		/**
		 * The current normalized position of the tween. This will always be a value between 0 and `duration`.
		 * Changing this property directly will have unexpected results, use {{#crossLink "Tween/setPosition"}}{{/crossLink}}.
		 * @property position
		 * @type {Object}
		 * @default 0
		 * @readonly
		 */
		this.position = 0;

		/**
		 * The raw tween position. This value will be between `0` and `loops * duration` while the tween is active, or -1 before it activates.
		 * @property rawPosition
		 * @type {Number}
		 * @default -1
		 * @readonly
		 */
		this.rawPosition = -1;


	// private properties:
		/**
		 * @property _paused
		 * @type {Boolean}
		 * @default false
		 * @protected
		 */
		this._paused = true;

		/**
		 * @property _next
		 * @type {Tween}
		 * @default null
		 * @protected
		 */
		this._next = null;

		/**
		 * @property _prev
		 * @type {Tween}
		 * @default null
		 * @protected
		 */
		this._prev = null;

		/**
		 * @property _parent
		 * @type {Object}
		 * @default null
		 * @protected
		 */
		this._parent = null;

		/**
		 * @property _labels
		 * @type Object
		 * @protected
		 */
		this._labels = null;

		/**
		 * @property _labelList
		 * @type Array[Object]
		 * @protected
		 */
		this._labelList = null;

		if (props) {
			this.useTicks = !!props.useTicks;
			this.ignoreGlobalPause = !!props.ignoreGlobalPause;
			this.loop = props.loop === true ? -1 : (props.loop||0);
			this.reversed = !!props.reversed;
			this.bounce = !!props.bounce;
			this.timeScale = props.timeScale||1;
			props.onChange && this.addEventListener("change", props.onChange);
			props.onComplete && this.addEventListener("complete", props.onComplete);
		}

		// while `position` is shared, it needs to happen after ALL props are set, so it's handled in _init()
  }

// accessor properties:
	/**
	 * Returns a list of the labels defined on this tween sorted by position.
	 * @property labels
	 * @return {Array[Object]} A sorted array of objects with label and position properties.
	 */
	get labels () {
		let list = this._labelList;
		if (!list) {
			list = this._labelList = [];
			let labels = this._labels;
			for (let label in labels) {
				list.push({ label, position: labels[label] });
			}
			list.sort((a, b) => a.position - b.position);
		}
		return list;
	}

  /**
	 * Defines labels for use with gotoAndPlay/Stop. Overwrites any previously set labels.
	 * @param {Object} labels An object defining labels for using {{#crossLink "Timeline/gotoAndPlay"}}{{/crossLink}}/{{#crossLink "Timeline/gotoAndStop"}}{{/crossLink}}
	 * in the form `{myLabelName:time}` where time is in milliseconds (or ticks if `useTicks` is `true`).
	 */
	set labels (labels) {
		this._labels = labels;
		this._labelList = null;
	}

// public methods:
	/**
	 * Advances the tween by a specified amount.
	 * @method advance
	 * @param {Number} delta The amount to advance in milliseconds (or ticks if useTicks is true). Negative values are supported.
	 * @param {Boolean} [ignoreActions=false] If true, actions will not be executed due to this change in position.
	 */
	advance (delta, ignoreActions = false) {
		this.setPosition(this.rawPosition+delta*this.timeScale, ignoreActions);
	}

	/**
	 * Advances the tween to a specified position.
	 * @method setPosition
	 * @param {Number} rawPosition The raw position to seek to in milliseconds (or ticks if useTicks is true).
	 * @param {Boolean} [ignoreActions=false] If true, do not run any actions that would be triggered by this operation.
	 * @param {Boolean} [jump=false] If true, only actions at the new position will be run. If false, actions between the old and new position are run.
	 * @param {Function} [callback] Primarily for use with MovieClip, this callback is called after properties are updated, but before actions are run.
	 */
	setPosition (rawPosition, ignoreActions = false, jump = false, callback) {
		let d = this.duration, loopCount = this.loop, prevRawPos = this.rawPosition;
		let loop = 0, t = 0, end = false;

		// normalize position:
		if (rawPosition < 0) { rawPosition = 0; }

		if (d === 0) {
			// deal with 0 length tweens.
			end = true;
			if (prevRawPos !== -1) { return end; } // we can avoid doing anything else if we're already at 0.
		} else {
			loop = rawPosition / d | 0;
			t = rawPosition - loop * d;

			end = (loopCount !== -1 && rawPosition >= loopCount * d + d);
			if (end) { rawPosition = (t = d) * (loop = loopCount) + d; }
			if (rawPosition === prevRawPos) { return end; } // no need to update

			let rev = !this.reversed !== !(this.bounce && loop % 2); // current loop is reversed
			if (rev) { t = d - t; }
		}

		// set this in advance in case an action modifies position:
		this.position = t;
		this.rawPosition = rawPosition;

		this._updatePosition(jump, end);
		if (end) { this.setPaused(true); }

		callback && callback(this);

		if (!ignoreActions) { this._runActions(prevRawPos, rawPosition, jump, !jump && prevRawPos === -1); }

		this.dispatchEvent("change");
		if (end) { this.dispatchEvent("complete"); }
	}

	/**
	 * Calculates a normalized position based on a raw position. For example, given a tween with a duration of 3000ms set to loop:
	 * 	console.log(myTween.calculatePosition(3700); // 700
	 * @method calculatePosition
	 * @param {Number} rawPosition A raw position.
	 */
	calculatePosition (rawPosition) {
		// largely duplicated from setPosition, but necessary to avoid having to instantiate generic objects to pass values (end, loop, position) back.
		let d = this.duration, loopCount = this.loop, loop = 0, t = 0;

		if (d === 0) { return 0; }
		if (loopCount !== -1 && rawPosition >= loopCount * d + d) { t = d; loop = loopCount } // end
		else if (rawPosition < 0) { t = 0; }
		else { loop = rawPosition /d | 0; t = rawPosition - loop * d; }

		let rev = !this.reversed !== !(this.bounce && loop % 2); // current loop is reversed
		return rev ? d - t : t;
	}

	/**
	 * Adds a label that can be used with {{#crossLink "Timeline/gotoAndPlay"}}{{/crossLink}}/{{#crossLink "Timeline/gotoAndStop"}}{{/crossLink}}.
	 * @method addLabel
	 * @param {String} label The label name.
	 * @param {Number} position The position this label represents.
	 */
	addLabel (label, position) {
		if (!this._labels) { this._labels = {}; }
		this._labels[label] = position;
		let list = this._labelList;
		if (list) {
			for (let i = 0, l = list.length; i < l; i++) { if (position < list[i].position) { break; } }
			list.splice(i, 0, { label, position });
		}
	}

	/**
	 * Returns the name of the label on or immediately before the current position. For example, given a tween with
	 * two labels, "first" on frame index 4, and "second" on frame 8, getCurrentLabel would return:
	 * <UL>
	 * 		<LI>null if the current position is 2.</LI>
	 * 		<LI>"first" if the current position is 4.</LI>
	 * 		<LI>"first" if the current position is 7.</LI>
	 * 		<LI>"second" if the current position is 15.</LI>
	 * </UL>
	 * @method getCurrentLabel
	 * @return {String} The name of the current label or null if there is no label
	 */
	getCurrentLabel (pos) {
		let labels = this.labels, i, l;
		if (pos == null) { pos = this.position; }
		for (i = 0, l = labels.length; i < l; i++) { if (pos < labels[i].position) { break; } }
		return i === 0 ? null : labels[i - 1].label;
	}

	/**
	 * Unpauses this timeline and jumps to the specified position or label.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The position in milliseconds (or ticks if `useTicks` is `true`)
	 * or label to jump to.
	 */
	gotoAndPlay (positionOrLabel) {
		this.setPaused(false);
		this._goto(positionOrLabel);
	}

	/**
	 * Pauses this timeline and jumps to the specified position or label.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The position in milliseconds (or ticks if `useTicks` is `true`) or label
	 * to jump to.
	 */
	gotoAndStop (positionOrLabel) {
		this.setPaused(true);
		this._goto(positionOrLabel);
	}

	/**
	 * If a numeric position is passed, it is returned unchanged. If a string is passed, the position of the
	 * corresponding frame label will be returned, or `null` if a matching label is not defined.
	 * @method resolve
	 * @param {String|Number} positionOrLabel A numeric position value or label string.
	 */
	resolve (positionOrLabel) {
		let pos = Number(positionOrLabel);
		if (isNaN(pos)) { pos = this._labels && this._labels[positionOrLabel]; }
		return pos;
	}

	/**
	 * Pauses or plays this tween.
	 * @method setPaused
	 * @param {Boolean} [value=true] Indicates whether the tween should be paused (`true`) or played (`false`).
	 * @return {Tween} This tween instance (for chaining calls)
	 * @chainable
	 */
	setPaused (value) {
		Tween._register(this, value);
		return this;
	}

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 */
	toString () {
		return `[${this.constructor.name}${this.name ? ` (name=${this.name})` : ""}]`;
	}

	/**
	 * @method clone
	 * @protected
	 */
	clone () {
		throw("AbstractTween can not be cloned.")
	}

// private methods:
	/**
	 * Shared logic that executes at the end of the subclass constructor.
	 * @method _init
	 * @protected
	 */
	_init (props) {
		if (!props || !props.paused) { this.setPaused(false); }
		if (props && props.position != null) { this.setPosition(props.position); }
	}

	/**
	 * @method _goto
	 * @protected
	 */
	_goto (positionOrLabel) {
		let pos = this.resolve(positionOrLabel);
		if (pos != null) { this.setPosition(pos, false, true); }
	}

	/**
   * Runs actions between startPos & endPos. Separated to support action deferral.
	 * @method _runActions
	 * @protected
	 */
	_runActions (startRawPos, endRawPos, jump, includeStart) {
	  // console.log(this.passive === false ? " > Tween" : "Timeline", "run", startRawPos, endRawPos, jump, includeStart);
		// if we don't have any actions, and we're not a Timeline, then return:
		// TODO: a cleaner way to handle this would be to override this method in Tween, but I'm not sure it's worth the overhead.
		if (!this._actionHead && !this._tweens) { return; }

		let d = this.duration, reversed = this.reversed, bounce = this.bounce, loopCount = this.loop;
		let loop0, loop1, t0, t1;

		if (d === 0) {
			// deal with 0 length tweens:
			loop0 = loop1 = t0 = t1 = 0;
			reversed = bounce = false;
		} else {
			loop0 = startRawPos / d | 0;
			loop1 = endRawPos / d | 0;
			t0 = startRawPos - loop0 * d;
			t1 = endRawPos - loop1 * d;
		}

		// catch positions that are past the end:
		if (loopCount !== -1) {
			if (loop1 > loopCount) { t1 = d; loop1 = loopCount; }
			if (loop0 > loopCount) { t0 = d; loop0 = loopCount; }
		}

		// special cases:
		if (jump) { return this._runActionsRange(t1, t1, jump, includeStart); } // jump.
		else if (loop0 === loop1 && t0 === t1 && !jump) { return; } // no actions if the position is identical.
		else if (loop0 === -1) { loop0 = t0 = 0; } // correct the -1 value for first advance, important with useTicks.

		let dir = (startRawPos <= endRawPos), loop = loop0;
		do {
			let rev = !reversed !== !(bounce && loop % 2);

			let start = (loop === loop0) ? t0 : dir ? 0 : d;
			let end = (loop === loop1) ? t1 : dir ? d : 0;

			if (rev) {
				start = d - start;
				end = d - end;
			}

			if (bounce && loop !== loop0 && start === end) { /* bounced onto the same time/frame, don't re-execute end actions */ }
			else if (this._runActionsRange(start, end, jump, includeStart || (loop !== loop0 && !bounce))) { return true; }

			includeStart = false;
		} while ((dir && ++loop <= loop1) || (!dir && --loop >= loop1));
	}

  /**
	 * @method _runActionsRange
   * @abstract
	 * @protected
	 */
	_runActionsRange (startPos, endPos, jump, includeStart) {
		// throw("_runActionsRange is abstract and must be overridden by a subclass");
	}

  /**
	 * @method _updatePosition
   * @abstract
	 * @protected
	 */
	_updatePosition (jump, end) {
    // throw("_updatePosition is abstract and must be overridden by a subclass");
	}

}

// events:
/**
 * Dispatched whenever the tween's position changes.
 * @event change
 */
/**
 * Dispatched when the tween reaches its end and has paused itself. This does not fire until all loops are complete;
 * tweens that loop continuously will never fire a complete event.
 * @event complete
 */
