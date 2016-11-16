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

/**
 * @module TweenJS
 */

// namespace:
this.createjs = this.createjs||{};


(function() {
	"use strict";
	

// constructor	
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
	 * @constructor
	 **/
	function Timeline(props) {
		var tweens, labels;
		// handle old params (tweens, labels, props):
		// TODO: deprecated.
		if (props instanceof Array || (props == null && arguments.length > 1)) {
			tweens = props;
			labels = arguments[1];
			props = arguments[2];
		} else if (props) {
			tweens = props.tweens;
			labels = props.labels;
		}
		
		this.AbstractTween_constructor(props);

	// private properties:
		/**
		 * @property _tweens
		 * @type Array[Tween]
		 * @protected
		 **/
		this._tweens = [];
		
		if (tweens) { this.addTween.apply(this, tweens); }
		this.setLabels(labels);
		
		if (props&&props.position!=null) { this.setPosition(props.position); }
	};
	
	var p = createjs.extend(Timeline, createjs.AbstractTween);

	// TODO: deprecated
	// p.initialize = function() {}; // searchable for devs wondering where it is. REMOVED. See docs for details.

	
// events:
	// docced in AbstractTween.


// public methods:
	/**
	 * Adds one or more tweens (or timelines) to this timeline. The tweens will be paused (to remove them from the
	 * normal ticking system) and managed by this timeline. Adding a tween to multiple timelines will result in
	 * unexpected behaviour.
	 * @method addTween
	 * @param {Tween} ...tween The tween(s) to add. Accepts multiple arguments.
	 * @return {Tween} The first tween that was passed in.
	 **/
	p.addTween = function(tween) {
		if (tween._parent) { tween._parent.removeTween(tween); }
		
		var l = arguments.length;
		if (l > 1) {
			for (var i=0; i<l; i++) { this.addTween(arguments[i]); }
			return arguments[l-1];
		} else if (l === 0) { return null; }
		
		this._tweens.push(tween);
		tween._parent = this;
		tween.setPaused(true);
		var d = tween.duration;
		if (tween.loop > 0) { d *= tween.loop+1; }
		if (d > this.duration) { this.duration = d; }
		
		if (this.rawPosition >= 0) { tween.setPosition(this.rawPosition); }
		return tween;
	};

	/**
	 * Removes one or more tweens from this timeline.
	 * @method removeTween
	 * @param {Tween} ...tween The tween(s) to remove. Accepts multiple arguments.
	 * @return Boolean Returns `true` if all of the tweens were successfully removed.
	 **/
	p.removeTween = function(tween) {
		var l = arguments.length;
		if (l > 1) {
			var good = true;
			for (var i=0; i<l; i++) { good = good && this.removeTween(arguments[i]); }
			return good;
		} else if (l === 0) { return true; }

		var tweens = this._tweens;
		var i = tweens.length;
		while (i--) {
			if (tweens[i] === tween) {
				tweens.splice(i, 1);
				tween._parent = null;
				if (tween.duration >= this.duration) { this.updateDuration(); }
				return true;
			}
		}
		return false;
	};

	/**
	 * Recalculates the duration of the timeline. The duration is automatically updated when tweens are added or removed,
	 * but this method is useful if you modify a tween after it was added to the timeline.
	 * @method updateDuration
	 **/
	p.updateDuration = function() {
		this.duration = 0;
		for (var i=0,l=this._tweens.length; i<l; i++) {
			var tween = this._tweens[i];
			var d = tween.duration;
			if (tween.loop > 0) { d *= tween.loop+1; }
			if (d > this.duration) { this.duration = d; }
		}
	};

	/**
	* Returns a string representation of this object.
	* @method toString
	* @return {String} a string representation of the instance.
	**/
	p.toString = function() {
		return "[Timeline]";
	};

	/**
	 * @method clone
	 * @protected
	 **/
	p.clone = function() {
		throw("Timeline can not be cloned.")
	};

// private methods:
	
	// Docced in AbstractTween
	p._updatePosition = function(jump, end) {
		var t = this.position;
		for (var i=0, l=this._tweens.length; i<l; i++) {
			this._tweens[i].setPosition(t, true, jump); // actions will run after all the tweens update.
		}
	};
	
	// Docced in AbstractTween
	p._runActionsRange = function(startPos, endPos, jump, includeStart) {
		//console.log("	range", startPos, endPos, jump, includeStart);
		var t = this.position;
		for (var i=0, l=this._tweens.length; i<l; i++) {
			this._tweens[i]._runActions(startPos, endPos, jump, includeStart);
			if (t !== this.position) { return true; } // an action changed this timeline's position.
		}
	};


	createjs.Timeline = createjs.promote(Timeline, "AbstractTween");

}());
