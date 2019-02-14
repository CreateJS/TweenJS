/**
 * TweenGroup
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
 *
 * @license
 */

/**
 * TweenGroup allows you to pause and time scale a collection of tweens or timelines. For example, this could be
 * used to stop all tweens associated with a view when leaving that view.
 * Tweens are automatically removed from the group when they complete (ie. when the `complete` event fires).
 *
 * @example
 * myView.tweens = new createjs.TweenGroup();
 * myView.tweens.get(spinner, {loop: -1}).to({rotation:360}, 500);
 * myView.tweens.get(image).to({alpha: 1}, 5000);
 * // ... make all tweens in this view run in slow motion:
 * myView.tweens.timeScale = 0.1;
 * // ... pause all this view's active tweens:
 * myView.tweens.paused = true; // stop all tweens.
 *
 * @example <caption<Add a group to another group to nest it</caption>
 * viewTweenGroup.add(buttonTweenGroup);
 */
export default class TweenGroup {

	/**
	 * @param {Boolean} [paused] The initial paused property value for this group.
	 * @param {Number} [timeScale] The intiial timeScale property value for this group.
	 */
	constructor(paused, timeScale) {
		this._tweens = [];
		this.paused = paused;
		this.timeScale = timeScale;
		this.__onComplete = this._onComplete.bind(this);
	}

	/**
	 * Pauses or unpauses the group. The value is propagated to every tween or group that has been added to this group.
	 * @type {Boolean}
	 */
	get paused() {
		return this._paused;
	}
	set paused(value) {
		const tweens = this._tweens;
		this._paused = value = !!value;
		for (let i = tweens.length - 1; i >= 0; i--) {
			tweens[i].paused = value;
		}
	}

	/**
	 * Sets the time scale of the group. The value is propagated to every tween or group that has been added to this group.
	 * @type {Number}
	 */
	get timeScale() {
		return this._timeScale;
	}
	set timeScale(value) {
		const tweens = this._tweens;
		this._timeScale = value = value || null;
		for (let i = tweens.length - 1; i >= 0; i--) {
			tweens[i].timeScale = value;
		}
	}

	/**
	 * Shortcut method to create a new tween instance via {@link tweenjs.Tween.get} and immediately add it to this group.
	 * @param {Object} target The target object that will have its properties tweened.
	 * @param {Object} [props] The configuration properties to apply to this instance.
	 * @return {tweenjs.Tween} A reference to the created tween.
	 */
	get(target, props) {
		return this.add(Tween.get(target, props));
	}

	/**
	 * Adds a Tween, Timeline, or TweenGroup instance to this group. The added object will immediately have its `paused` and `timeScale` properties
	 * set to the value of this group's corresponding properties.
	 *
	 * @example
	 * myGroup.paused = true;
	 * myGroup.add(myTween); // myTween is now paused
	 * // ...
	 * myGroup.paused = false; // myTween is now unpaused
	 * // can also add multiple objects:
	 * myGroup.add(myTween, myTween2, myTimeline, myOtherGroup);
	 *
	 * @param {...tweenjs.Tween|tweenjs.Timeline|tweenjs.TweenGroup} tweens The tween, timeline, or tween group to add.
	 * @return {Object} This tween that was added.
	 */
	add(...tweens) {
		const l = tweens.length;
		for (let i = 0; i < l; i++) {
			const tween = tweens[i];
			tween.paused = this._paused;
			if (this._timeScale !== null) { tween.timeScale = this._timeScale; }
			this._tweens.push(tween);
			tween.addEventListener && tween.addEventListener("complete", this.__onComplete);
		}
		return tweens[l - 1];
	}

	/**
	 * Removes a Tween, Timeline, or TweenGroup instance from this group.
	 * Note that tweens and timelines are automatically removed when their `complete` event fires.
	 *
	 * @example
	 * myGroup.remove(myTween);
	 * // can also remove multiple objects:
	 * myGroup.remove(myTween, myTween2, myTimeline, myOtherGroup);
	 *
	 * @param {...tweenjs.Tween|tweenjs.Timeline|tweenjs.TweenGroup} tweens The tween, timeline, or tween group to remove.
	 */
	remove(...tweens) {
		const l = tweens.length;
		const t = this._tweens;
		for (let i = 0; i < l; i++) {
			const tween = tweens[i];
			for (let j = t.length - 1; j >= 0; j--) {
				if (t[j] === tween) {
					t.splice(j, 1);
					tween.removeEventListener && tween.removeEventListener("complete", this.__onComplete);
				}
			}
		}
	}

	/**
	 * Pauses all child tweens/timelines/groups and removes them from this group. Child groups will also be reset.
	 * @param {Boolean} keepGroups If true, groups will not be removed, only reset.
	 * @return {tweenjs.TweenGroup} This instance (for chaining calls).
	 * @chainable
	 */
	reset(keepGroups) {
		const tweens = this._tweens;
		for (let i = tweens.length - 1; i >= 0; i--) {
			const tween = tweens[i];
			if (tween instanceof TweenGroup) {
				tween.reset();
				if (keepGroups) { continue; }
			}
			tweens.splice(i,1);
			tween.paused = true;
			tween.removeEventListener && tween.removeEventListener("complete", this.__onComplete);
		}
		return this;
	}

	/**
	 * @param {Object} evt
	 * @protected
	 */
	_onComplete(evt) {
		this.remove(evt.target);
	}

}
