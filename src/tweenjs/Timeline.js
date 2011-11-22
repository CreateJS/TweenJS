/*
* Timeline by Grant Skinner. Mar 7, 2011
* Visit http://easeljs.com/ for documentation, updates and examples.
*
*
* Copyright (c) 2010 Grant Skinner
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
* The Easel Javascript library provides a retained graphics mode for canvas 
* including a full, hierarchical display list, a core interaction model, and 
* helper classes to make working with Canvas much easier.
* @module EaselJS
**/

(function(window) {


/**
* Base class that all filters should inherit from.
* @class Timeline
* @constructor
**/
Timeline = function(tweens, labels, props) {
  this.initialize(tweens, labels, props);
}
var p = Timeline.prototype;

// public properties:
	p.duration = 0;
	p.loop = false;

// private properties:
	p._paused = true;
	p._tweens = null;
	p._labels = null;
	p._prevPosition = 0;
	p._prevPos = 0;
	p._useTicks = false;
	
// constructor:
	/** 
	* Initialization method.
	* @method initialize
	* @protected
	**/
	p.initialize = function(tweens, labels, props) {
		this._tweens = [];
		if (tweens) { this.addTween.apply(this, tweens); }
		this.setLabels(labels);
		this.setPaused(false);
		if (props) {
			this._useTicks = props.useTicks;
			this.loop = props.loop;
		}
	}
	
// public methods:
	// adds one or more tweens to this timeline.
	p.addTween = function(tween) {
		var l = arguments.length;
		if (l > 1) {
			for (var i=0; i<l; i++) { this.addTween(arguments[i]); }
			return arguments[l-1];
		} else if (l == 0) { return; }
		this.removeTween(tween);
		this._tweens.push(tween);
		tween.setPaused(true);
		tween._paused = false;
		if (tween.duration > this.duration) { this.duration = tween.duration; }
		return tween;
	}

	// removes one or more tweens from this timeline.
	p.removeTween = function(tween) {
		var l = arguments.length;
		if (l > 1) {
			var good = true;
			for (var i=0; i<l; i++) { good = good && this.removeTween(arguments[i]); }
			return good;
		} else if (l == 0) { return; }
		var index = this._tweens.indexOf(tween);
		if (index != -1) {
			this._tweens.splice(index,1);
			if (tween.duration >= this.duration) { this.updateDuration(); }
			return true;
		} else { return false; }
	}

	/**
	 * The current playback position
	 * @method currentPosition
	 * @return (Float) The current playback position
	 **/
	p.currentPosition = function() {
		return this._prevPosition;
	}

	/**
	 * The label of the current playback position
	 * @method currentPositionLabel
	 * @return (String) The label of the current position
	 **/
	p.currentPositionLabel = function() {
		var lbls = this.getLabels();
		for (var i=lbls.length-1; i>=0; i--) {
			if (lbls[i].getPosition() == this.currentPosition()) {
				return lbls[i].getName();
			}
		}
		return null;
	}
	
	/**
	 * The current label in which the position is located in
	 * @method currentLabel
	 * @return (String) The current label in which the position is located in
	 **/
	p.currentLabel = function() {
		var lbls = this.getLabels();
		for (var i=lbls.length-1; i>=0; i--) {
			if (lbls[i].getPosition() <= this.currentPosition()) {
				return lbls[i].getName();
			}
		}
		return null;
	}

	/**
	 * Adds one or more labels to this timeline.
	 * @method addLabel
	 * @param (PositionLabel) label A label object containing the position and name of the label
	 * @return (Timeline) A reference to the Timeline for method chaining
	 **/
	p.addLabel = function(label) {
		var l = arguments.length;
		if (l > 1) {
			for (var i=0; i<l; i++) { this.addLabel(arguments[i]); }
			return arguments[l-1];
		} else if (l == 0) { return; }
		this._labels[label.getName()] = label.getPosition();
		return this;
	}

	/**
	 * Returns an Array of all the labels assigned to this Timeline
	 * @method getLabels
	 * @return (Array) A list of PositionLabel objects
	 **/
	p.getLabels = function() {
		var list = [];
		for (label in this._labels) {
			list.push(new PositionLabel(this._labels[label], label));
		}
		list.sort(function(a,b){
			return a.getPosition() - b.getPosition();
		});
		return list;
	}
	
	p.setLabels = function(o) {
		this._labels = o ?  o : {};
	}
	
	p.gotoAndPlay = function(positionOrLabel) {
		this.setPaused(false);
		this._goto(positionOrLabel);
	}
	
	p.gotoAndStop = function(positionOrLabel) {
		this.setPaused(true);
		this._goto(positionOrLabel);
	}

	//
	p.setPosition = function(value) {
		if (value == this._prevPosition) { return; }
		var t = this.loop ? value%this.duration : value;
		this._prevPosition = value;
		var prevPos = this._prevPos;
		this._prevPos = t; // in case an action changes the current frame.
		var completeCount = 0;
		for (var i=0, l=this._tweens.length; i<l; i++) {
			var tween = this._tweens[i];
			// TODO: add support for tweens with loop=true.
			if (tween._prevPosition >= tween.duration && t>prevPos) {
				completeCount++;
			} else {
				completeCount += tween.setPosition(t);
				if (t != this._prevPos) { return; } // an action changed this timeline.
			}
		}
		if (!this.loop && completeCount == l) { this.setPaused(true); } // end
	}

	//
	p.setPaused = function(value) {
		if (this._paused == !!value) { return; }
		this._paused = !!value;
		Tween._register(this, !value);
	}
	
	// updates duration, useful if you modify a tween that was already added to the timeline.
	p.updateDuration = function(tween) {
		if (tween) {
			if (tween.duration > this.duration) { this.duration = tween.duration; }
		} else {
			this.duration = 0;
			for (var i=0,l=this._tweens.length; i<l; i++) {
				tween = this._tweens[i];
				if (tween.duration > this.duration) { this.duration = tween.duration; }
			}
		}
		return this.duration;
	}
	
	//
	p.tick = function(delta) {
		this.setPosition(this._prevPosition+delta);
	}

	/**
	* Returns a string representation of this object.
	* @method toString
	* @return {String} a string representation of the instance.
	**/
	p.toString = function() {
		return "[Timeline]";
	}
	
	
	/**
	* Returns a clone of this Timeline instance.
	* @method clone
	 @return {Timeline} A clone of the current Timeline instance.
	**/
	p.clone = function() {
		return new Timeline();
	}
	
// private methods:
	p._goto = function(positionOrLabel) {
		var pos = parseFloat(positionOrLabel);
		if (isNaN(pos)) {
			pos = this._labels[positionOrLabel];
		}
		if (pos != null) {
			this.setPosition(pos);
		}
	}
	
window.Timeline = Timeline;
}(window));
