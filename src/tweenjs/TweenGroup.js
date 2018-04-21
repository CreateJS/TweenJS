/*
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
*/

/**
 * @module TweenJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
	"use strict";

	/**
	 * TweenGroup allows you to pause and time scale a collection of tweens or timelines. For example, this could be
	 * used to stop all tweens associated with a view when leaving that view.
	 * 
	 * 	myView.tweens = new createjs.TweenGroup();
	 * 	myView.tweens.get(spinner, {loop: -1}).to({rotation:360}, 500);
	 * 	myView.tweens.get(image).to({alpha: 1}, 5000);
	 * 	// ... make all tweens in this view run in slow motion:
	 * 	myView.tweens.timeScale = 0.1;
	 * 	// ... pause all this view's active tweens:
	 * 	myView.tweens.paused = true; // stop all tweens.
	 * 
	 * You can add a group to another group to nest it.
	 * 
	 * 	viewTweenGroup.add(buttonTweenGroup);
	 * 
	 * Tweens are automatically removed from the group when they complete (ie. when the `complete` event fires).
	 * 
	 * @class TweenGroup
	 * @param {Boolean} [paused] The initial paused property value for this group.
	 * @param {Number} [timeScale] The intiial timeScale property value for this group.
	 * @constructor
	 **/
	function TweenGroup(paused, timeScale) {
		this._tweens = [];
		this.paused = paused;
		this.timeScale = timeScale;
		this.__onComplete = this._onComplete.bind(this);
	};
	var s = TweenGroup, p = TweenGroup.prototype;

// getter / setters:

	/**
	 * @method _setPaused
	 * @param {Boolean} value
	 * @protected
	 **/
	p._setPaused = function(value) {
		var tweens = this._tweens;
		this._paused = value = !!value;
		for (var i=tweens.length-1; i>=0; i--) {
			tweens[i].paused = value;
		}
	};
	
	/**
	 * @method _getPaused
	 * @return {Boolean}
	 * @protected
	 **/
	p._getPaused = function() {
		return this._paused;
	};

	/**
	 * @method _setTimeScale
	 * @param {Number} value
	 * @protected
	 **/
	p._setTimeScale = function(value) {
		var tweens = this._tweens;
		this._timeScale = value = value||null;
		for (var i=tweens.length-1; i>=0; i--) {
			tweens[i].timeScale = value;
		}
	};
	
	/**
	 * @method _getTimeScale
	 * @return {Number}
	 * @protected
	 **/
	p._getTimeScale = function() {
		return this._timeScale;
	};

	/**
	 * Pauses or unpauses the group. The value is propagated to every tween or group that has been added to this group.
	 * @property paused
	 * @type Boolean
	 **/

	/**
	 * Sets the time scale of the group. The value is propagated to every tween or group that has been added to this group.
	 * @property timeScale
	 * @type Number
	 **/
	try {
		Object.defineProperties(p, {
			paused: { set: p._setPaused, get: p._getPaused },
			timeScale: { set: p._setTimeScale, get: p._getTimeScale }
		});
	} catch (e) {}
	
// public methods:
	/**
	 * Shortcut method to create a new tween instance via {{#crossLink "Tween/get"}}{{/crossLink}} and immediately add it to this group.
	 * @method get
	 * @param {Object} target The target object that will have its properties tweened.
	 * @param {Object} [props] The configuration properties to apply to this instance. See {{#crossLink "Tween/get"}}{{/crossLink}} for more information.
	 * @return {Tween} A reference to the created tween.
	 **/
	p.get = function(target, props) {
		return this.add(createjs.Tween.get(target, props));
	}

	/**
	 * Adds a Tween, Timeline, or TweenGroup instance to this group. The added object will immediately have its `paused` and `timeScale` properties
	 * set to the value of this group's corresponding properties.
	 * 
	 * 	myGroup.paused = true;
	 * 	myGroup.add(myTween); // myTween is now paused
	 * 	// ...
	 * 	myGroup.paused = false; // myTween is now unpaused
	 * 
	 * You can also add multiple objects:
	 * 
	 * 	myGroup.add(myTween, myTween2, myTimeline, myOtherGroup);
	 * 
	 * @method add
	 * @param {Tween,Timeline,TweenGroup} tween The tween, timeline, or tween group to add.
	 * @return {Object} This tween that was added.
	 **/
	p.add = function(tween) {
		var l = arguments.length, tweens = this._tweens;
		for (var i=0, l=arguments.length; i<l; i++) {
			tween = arguments[i];
			tween.paused = this._paused;
			if (this._timeScale !== null) { tween.timeScale = this._timeScale; }
			tweens.push(tween);
			tween.addEventListener&&tween.addEventListener("complete", this.__onComplete);
		}
		return arguments[l-1];
	}

	/**
	 * Removes a Tween, Timeline, or TweenGroup instance from this group. 
	 * 
	 * 	myGroup.remove(myTween);
	 * 
	 * You can also remove multiple objects:
	 * 
	 * 	myGroup.remove(myTween, myTween2, myTimeline, myOtherGroup);
	 * 
	 * Note that tweens and timelines are automatically removed when their `complete` event fires.
	 * @method remove
	 * @param {Tween,Timeline,TweenGroup} tween The tween, timeline, or tween group to remove.
	 **/
	p.remove = function(tween) {
		var l = arguments.length, tweens = this._tweens;
		for (var i=0; i<l; i++) {
			tween = arguments[i];
			for (var j=tweens.length-1; j>=0; j--) {
				if (tweens[j] === tween) {
					tweens.splice(j, 1);
					tween.removeEventListener&&tween.removeEventListener("complete", this.__onComplete);
				}
			}
		}
	}

	/**
	 * Pauses all child tweens/timelines/groups and removes them from this group. Child groups will also be reset.
	 * @method reset
	 * @param {Boolean} keepGroups If true, groups will not be removed, only reset.
	 * @return {TweenGroup} This instance (for chaining calls).
	 * @chainable
	 **/
	p.reset = function(keepGroups) {
		var tweens = this._tweens;
		for (var i=tweens.length-1; i>=0; i--) {
			var tween = tweens[i];
			if (tween instanceof TweenGroup) {
				tween.reset();
				if (keepGroups) { continue; }
			}
			tweens.splice(i,1);
			tween.paused = true;
			tween.removeEventListener&&tween.removeEventListener("complete", this.__onComplete);
		}
		return this;
	}

// private methods:

	/**
	 * @method _onComplete
	 * @param {Object} evt
	 * @protected
	 **/
	p._onComplete = function(evt) {
		this.remove(evt.target);
	}

	createjs.TweenGroup = s;
}());
