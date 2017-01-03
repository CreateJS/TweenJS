/*
* Timeline
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

import AbstractTween from "./AbstractTween";

/**
 * The Timeline class synchronizes multiple tweens and allows them to be controlled as a group. Please note that if a
 * timeline is looping, the tweens on it may appear to loop even if the "loop" property of the tween is false.
 *
 * NOTE: Timeline currently also accepts a param list in the form: `tweens, labels, props`. This is for backwards
 * compatibility only and will be removed in the future. Include tweens and labels as properties on the props object.
 * @class Timeline
 * @param {Object} [props] The configuration properties to apply to this instance (ex. `{loop:-1, paused:true}`).
 * Supported props are listed below. These props are set on the corresponding instance properties except where
 * specified.<UL>
 *    <LI> `useTicks`</LI>
 *    <LI> `ignoreGlobalPause`</LI>
 *    <LI> `loop`</LI>
 *    <LI> `reversed`</LI>
 *    <LI> `bounce`</LI>
 *    <LI> `timeScale`</LI>
 *    <LI> `paused`: indicates whether to start the tween paused.</LI>
 *    <LI> `position`: indicates the initial position for this tween.</LI>
 *    <LI> `onChange`: adds the specified function as a listener to the `change` event</LI>
 *    <LI> `onComplete`: adds the specified function as a listener to the `complete` event</LI>
 * </UL>
 * @extends AbstractTween
 * @module TweenJS
 */
export default class Timeline extends AbstractTween {

// constructor
	/**
	 * @constructor
	 * @param {Object} props
	 */
	constructor (props) {
		super(props);

	// private properties:
		/**
		 * @property _tweens
		 * @type Array[Tween]
		 * @protected
		 */
		this._tweens = [];

		if (props.tweens) { this.addTween(...tweens); }
		this.labels = props.labels;

		this._init(props);
	}


// public methods:
	/**
	 * Adds one or more tweens (or timelines) to this timeline. The tweens will be paused (to remove them from the
	 * normal ticking system) and managed by this timeline. Adding a tween to multiple timelines will result in
	 * unexpected behaviour.
	 * @method addTween
	 * @param {Tween} ...tween The tween(s) to add. Accepts multiple arguments.
	 * @return {Tween} The first tween that was passed in.
	 */
	addTween (...tweens) {
		let l = tweens.length;
		if (l > 1) {
			for (let i = 0; i < l; i++) { this.addTween(tweens[i]); }
			return tweens[l - 1];
		} else if (l === 0) { return null; }

		let tween = tweens[0];
		this._tweens.push(tween);
		tween._parent = this;
		tween.setPaused(true);
		let d = tween.duration;
		if (tween.loop > 0) { d *= tween.loop + 1; }
		if (d > this.duration) { this.duration = d; }

		if (this.rawPosition >= 0) { tween.setPosition(this.rawPosition); }
		return tween;
	}

	/**
	 * Removes one or more tweens from this timeline.
	 * @method removeTween
	 * @param {Tween} ...tween The tween(s) to remove. Accepts multiple arguments.
	 * @return Boolean Returns `true` if all of the tweens were successfully removed.
	 */
	removeTween (...tweens) {
		let l = tweens.length;
		if (l > 1) {
			let good = true;
			for (let i = 0; i < l; i++) { good = good && this.removeTween(tweens[i]); }
			return good;
		} else if (l === 0) { return true; }

		let tweens = this._tweens;
		let i = tweens.length;
		while (i--) {
			if (tweens[i] === tween) {
				tweens.splice(i, 1);
				tween._parent = null;
				if (tween.duration >= this.duration) { this.updateDuration(); }
				return true;
			}
		}
		return false;
	}

	/**
	 * Recalculates the duration of the timeline. The duration is automatically updated when tweens are added or removed,
	 * but this method is useful if you modify a tween after it was added to the timeline.
	 * @method updateDuration
	 */
	updateDuration () {
		this.duration = 0;
		for (let i = 0, l = this._tweens.length; i < l; i++) {
			let tween = this._tweens[i];
			let d = tween.duration;
			if (tween.loop > 0) { d *= tween.loop + 1; }
			if (d > this.duration) { this.duration = d; }
		}
	}

	/**
	 * @method clone
	 * @protected
	 */
	clone () {
		throw("Timeline can not be cloned.")
	}

// private methods:
	/**
	 * @method _updatePosition
	 * @override
	 */
	_updatePosition (jump, end) {
		let t = this.position;
		for (let i = 0, l = this._tweens.length; i < l; i++) {
			this._tweens[i].setPosition(t, true, jump); // actions will run after all the tweens update.
		}
	}

	/**
	 * @method _runActionsRange
	 * @override
	 */
	_runActionsRange (startPos, endPos, jump, includeStart) {
		//console.log("	range", startPos, endPos, jump, includeStart);
		let t = this.position;
		for (let i = 0, l = this._tweens.length; i < l; i++) {
			this._tweens[i]._runActions(startPos, endPos, jump, includeStart);
			if (t !== this.position) { return true; } // an action changed this timeline's position.
		}
	}

}
