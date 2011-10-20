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

// private properties:
	p._paused = false;
	p._tweens = null;
	p._labels = null;

/**
* Base class that all filters should inherit from.
* @class Timeline
* @constructor
**/
Timeline = function(tweens, labels) {
  this.initialize(tweens, labels);
}
var p = Timeline.prototype;
	
// constructor:
	/** 
	* Initialization method.
	* @method initialize
	* @protected
	**/
	p.initialize = function(tweens, labels) {
		this._tweens = [];
		if (tweens) { this.addTween.apply(this, tweens); }
		this._labels = labels ? labels : {};
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
			return true;
		} else { return false; }
	}

	p.addLabel = function(label, position) {
		this._labels[label] = position;
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
		for (var i=0, l=this._tweens.length; i<l; i++) {
			var tween = this._tweens[i];
			tween.setPosition(value);
		}
	}

	//
	p.setPaused = function(value) {
		this._paused = !!value;
		Tween._register(this, !value);
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
		var pos = parseFloat(position);
		if (isNaN(pos)) {
			pos = this._labels[pos];
		}
		if (pos != null) {
			this.setPosition(pos);
		}
	}
	
window.Timeline = Timeline;
}(window));