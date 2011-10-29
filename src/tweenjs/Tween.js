/*
* Tween by Grant Skinner. Mar 7, 2011
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
* The TweenJS Javascript library provides a simple but powerful tweening interface. It allows you to chain tweens and
 * actions together to create complex sequences. For example:<br/>
 * Tween.get(target).wait(500).to({alpha:0,visible:false},1000).call(onComplete);<br/>
 * This tween will wait 0.5s, tween the target's alpha property to 0 over 1s, set it's visible to false, then call the onComplete function.
* @module EaselJS
**/

//TODO: when CSS is true, use the style property for all prop targets.
(function(window) {
/**
 * Returns a new Tween instance. See Tween.get for param documentation.
* @class Tween
* @constructor
**/
Tween = function(target, props) {
  this.initialize(target, props);
}
var p = Tween.prototype;

// static interface:
	/** 
	 * @property _listeners
	 * @type Array[Tween]
	 * @static
	 * @protected 
	 **/
	Tween._tweens = [];
	
	/** 
	 * Defines the default suffix map for CSS tweens. This can be overridden on a per tween basis by specifying a
	 * cssSuffixMap value for the individual tween. The object maps CSS property names to the suffix to use when
	 * reading or setting those properties. For example a map in the form {top:"px"} specifies that when tweening
	 * the "top" CSS property, it should use the "px" suffix (ex. target.style.top = "20.5px"). This only applies
	 * to tweens with the "css" config property set to true.
	 * @property cssSuffixMap
	 * @type Object
	 * @static
	 **/
	Tween.cssSuffixMap = {top:"px",left:"px",bottom:"px",right:"px",width:"px",height:"px",opacity:""};

	/**
	 * Returns a new tween instance. This is functionally identical to using "new Tween(...)", but looks cleaner
	 * with the chained syntax of TweenJS.
	 * @method get
	 * @static
	 * @param target The target object that will have its properties tweened.
	 * @param props The configuration properties to apply to this tween instance (ex. {loop:true}). Supported props are:<UL>
	 *    <LI> loop: sets the loop property on this tween.</LI>
	 *    <LI> css: indicates this is a CSS tween. This causes it to use the style property of the target as the default target
	 *    		for property changes, and to use the cssSuffixMap property for generating CSS value strings.</LI>
	 *    <LI> useTicks: uses ticks for all durations instead of milliseconds.</LI>
	 *    <LI> ignoreGlobalPause: sets the ignoreGlobalPause property on this tween.</LI>
	 *    <LI> override: if true, Tween.removeTweens(target) will be called to remove any other tweens with the same target.
	 * </UL>
	 **/
	Tween.get = function(target, props) {
		return new Tween(target, props);
	}
	
	/**
	 * Advances all tweens. This typically uses the Ticker class, but you can call it manually if you prefer to use
	 * your own "heartbeat" implementation.
	 * @method tick
	 * @static
	 * @param delta The change in time in milliseconds since the last tick. Required unless all tweens have useTicks set to true.
	 * @param paused Indicates whether a global pause is in effect. Tweens with ignoreGlobalPause will ignore this, but all others will pause if this is true.
	 **/
	Tween.tick = function(delta,paused) {
		var tweens = Tween._tweens;
		for (var i=tweens.length-1; i>=0; i--) {
			var tween = tweens[i];
			if (paused && !tween.ignoreGlobalPause) { continue; }
			tween.tick(tween._useTicks?1:delta);
		}
	}
	if (Ticker) { Ticker.addListener(Tween,false); }
	
	
	/** 
	 * Removes all existing tweens for a target. This is called automatically if a tween's override config prop is true.
	 * @method removeTweens
	 * @static
	 * @param target
	 **/
	Tween.removeTweens = function(target) {
		if (!target.tweenjs_count) { return; }
		var tweens = Tween._tweens;
		for (var i=tweens.length-1; i>=0; i--) {
			if (tweens[i]._target == target) { tweens.splice(i,1); }
		}
		target.tweenjs_count = 0;
	}
	
	/** 
	 * Registers or unregisters a tween with the ticking system.
	 * @method _register
	 * @static
	 * @protected 
	 **/
	Tween._register = function(tween, value) {
		var target = tween._target;
		if (value) {
			if (target) { target.tweenjs_count = target.tweenjs_count ? target.tweenjs_count+1 : 1; }
			Tween._tweens.push(tween);
		} else {
			if (target) { target.tweenjs_count--; }
			var i = Tween._tweens.indexOf(tween);
			if (i != -1) { Tween._tweens.splice(i,1); }
		}
	}

// public properties:
	/**
	 * Causes this tween to continue playing when a global pause is active. For example, if TweenJS is using Ticker,
	 * then setting this to true (the default) will cause this tween to be paused when Ticker.setPaused(true) is called.
	 * See Tween.tick() for more info. Can be set via the props param.
	 * @property ignoreGlobalPause
	 * @type Boolean
	 **/
	p.ignoreGlobalPause = false;
	
	/**
	 * If true, the tween will loop when it reaches the end. Can be set via the props param.
	 * @property loop
	 * @type Boolean
	 **/
	p.loop = false;
	
	/**
	 * Overrides Tween.cssSuffixMap for this tween.
	 * @property cssSuffixMap
	 * @type Object
	 **/
	p.cssSuffixMap = null;
	
	/**
	 * Read-only property specifying the total duration of this tween in milliseconds (or ticks if useTicks is true).
	 * This value is automatically updated as you modify the tween.
	 * @property duration
	 * @type Number
	 **/
	p.duration = 0;

// private properties:
	
	/**
	 * @property _paused
	 * @type Boolean
	 * @protected
	 **/
	p._paused = false;
	
	/**
	 * @property _curQueueProps
	 * @type Object
	 * @protected
	 **/
	p._curQueueProps = null;
	
	/**
	 * @property _initQueueProps
	 * @type Object
	 * @protected
	 **/
	p._initQueueProps = null;
	
	/**
	 * @property _steps
	 * @type Array
	 * @protected
	 **/
	p._steps = null;
	
	/**
	 * @property _actions
	 * @type Array
	 * @protected
	 **/
	p._actions = null;
	
	/**
	 * Total position.
	 * @property _prevPosition
	 * @type Number
	 * @protected
	 **/
	p._prevPosition = 0;
	
	/**
	 * Normalized position.
	 * @property _prevPos
	 * @type Number
	 * @protected
	 **/
	p._prevPos = -1;
	
	/**
	 * @property _prevIndex
	 * @type Number
	 * @protected
	 **/
	p._prevIndex = -1;
	
	/**
	 * @property _target
	 * @type Object
	 * @protected
	 **/
	p._target = null;
	
	/**
	 * @property _css
	 * @type Boolean
	 * @protected
	 **/
	p._css = false;
	
	/**
	 * @property _useTicks
	 * @type Boolean
	 * @protected
	 **/
	p._useTicks = false;
	
// constructor:
	/** 
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(target, props) {
		this._target = target;
		if (props) {
			this._useTicks = props.useTicks;
			this._css = props.css;
			this.ignoreGlobalPause = props.ignoreGlobalPause;
			this.loop = props.loop;
			if (props.override) { Tween.removeTweens(target); }
		}
		
		this._curQueueProps = {};
		this._initQueueProps = {};
		this._steps = [];
		this._actions = [];
		this._catalog = [];
		
		Tween._register(this, true);
	}
	
// public methods:
	/** 
	 * Queues a wait (essentially an empty tween).
	 * @method wait
	 * @param duration The duration of the wait in milliseconds (or in ticks if useTicks is true).
	 **/
	p.wait = function(duration) {
		if (duration == null || duration <= 0) { return this; }
		var o = this._cloneProps(this._curQueueProps);
		return this._addStep({d:duration, p0:o, e:this._linearEase, p1:o});
	}

	/** 
	 * Queues a tween from the current values to the target properties. Set duration to 0 to jump to these value.
	 * Numeric properties will be tweened from their current value in the tween to the target value. Non-numeric
	 * properties will be set at the end of the specified duration.
	 * @method to
	 * @param props An object specifying property target values for this tween (Ex. {x:300} would tween the x property of the target to 300).
	 * @param duration The duration of the wait in milliseconds (or in ticks if useTicks is true).
	 * @param ease The easing function to use for this tween.
	 **/
	p.to = function(props, duration, ease) {
		if (isNaN(duration) || duration < 0) { duration = 0; }
		return this._addStep({d:duration||0, p0:this._cloneProps(this._curQueueProps), e:ease, p1:this._cloneProps(this._appendQueueProps(props))});
	}
	
	/** 
	 * Queues an action to call the specified function. For example: myTween.wait(1000).call(myFunction); would call myFunction() after 1s.
	 * @method call
	 * @param callback The function to call.
	 * @param params The parameters to call the function with. If this is omitted, then the function will be called with a single param pointing to this tween.
	 * @param scope The scope to call the function in. If omitted, it will be called in the target's scope.
	 **/
	p.call = function(callback, params, scope) {
		return this._addAction({f:callback, p:params ? params : [this], o:scope ? scope : this._target});
	}
	
	/** 
	 * Queues an action to set the specified props on the specified target. If target is null, it will use this tween's target.
	 * @method set
	 * @param props The properties to set (ex. {visible:false}).
	 * @param target The target to set the properties on. If omitted, they will be set on the tween's target.
	 **/
	p.set = function(props, target) {
		return this._addAction({f:this._set, o:this, p:[props, target ? target : this._target]});
	}
	
	/** 
	 * Queues an action to to play (unpause) the specified tween. This enables you to sequence multiple tweens.
	 * @method play
	 * @param tween The tween to play.
	 **/
	p.play = function(tween) {
		return this.call(tween.setPaused, [false], tween);
	}

	/** 
	 * Queues an action to to pause the specified tween.
	 * @method pause
	 * @param tween The tween to play. If null, it pauses this tween.
	 **/
	p.pause = function(tween) {
		if (!tween) { tween = this; }
		return this.call(tween.setPaused, [true], tween);
	}
	
	// TODO: rename params.
	/** 
	 * Advances the tween to a specified position in milliseconds (or ticks if useTicks is true).
	 * @method setPosition
	 * @param value The position to seek to.
	 * @param seek If true, then all actions (ex. call, play, pause, set) between the previous position and the new one will be executed.
	 * @return Boolean Returns true if the tween is complete (ie. the full tween has run & loop is false).
	 **/
	p.setPosition = function(value, seek) {
		if (value == this._prevPosition) { return false; }
		if (seek == null) { seek = true; }
		var t = value;
		var looped = false;
		if (t > this.duration) {
			if (this.loop) {
				t = t%this.duration;
				looped = (t<this._prevPos);
			} else { t = this.duration; }
		}
		if (t != this._prevPos) {
			if (t == this.duration && !this.loop) {
				// addresses problems with an ending zero length step.
				this._updateTargetProps(null,1);
			} else if (this._steps.length > 0) {
				// find our new tween index:
				for (var i=0, l=this._steps.length; i<l; i++) {
					if (this._steps[i].t > t) { break; }
				}
				var tween = this._steps[i-1];
				this._updateTargetProps(tween,(t-tween.t)/tween.d);
			}
		}

		// TODO: deal with multiple loops?
		if (seek && this._actions.length > 0) {
			if (looped) {
				this._runActions(this._prevPos, this.duration);
				this._runActions(0, t);
			} else {
				this._runActions(this._prevPos, t);
			}
		}
		this._prevPos = t;
		this._prevPosition = value;

		if (t == this.duration && !this.loop) {
			// ended:
			this.setPaused(true);
			return true;
		}
	}

	/** 
	 * Advances this tween by the specified amount of time in milliseconds (or ticks if useTicks is true).
	 * This is normally called automatically by the Tween engine (via Tween.tick), but is exposed for advanced uses.
	 * @method tick
	 * @param delta The time to advance in milliseconds (or ticks if useTicks is true).
	 **/
	p.tick = function(delta) {
		if (this._paused) { return; }
		this.setPosition(this._prevPosition+delta);
	}

	/** 
	 * Pauses or plays this tween.
	 * @method setPaused
	 * @param value Indicates whether the tween should be paused (true) or played (false).
	 **/
	// pauses or plays this tween.
	p.setPaused = function(value) {
		this._paused = !!value;
		Tween._register(this, !value);
	}

	// tiny api (primarily for tool output):
	p.w = p.wait;
	p.t = p.to;
	p.c = p.call;
	p.s = p.set;

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[Tween]";
	}
	
	/**
	 * @method clone
	 * @protected
	 **/
	p.clone = function() {
		throw("Tween is not cloneable.")
	}

// private methods:
	/**
	 * @method _updateTargetProps
	 * @protected
	 **/
	p._updateTargetProps = function(tween, ratio) {
		if (this._css) { var map = this.cssSuffixMap || Tween.cssSuffixMap; }
		var p0,p1,v0,v1;
		if (!tween && ratio == 1) {
			p0 = p1 = this._curQueueProps;
		} else {
			// apply ease to ratio.
			if (tween.e) { ratio = tween.e(ratio,0,1,1); }
			p0 = tween.p0;
			p1 = tween.p1;
		}

		for (n in this._initQueueProps) {
			if ((v0 = p0[n]) == null) { p0[n] = v0 = this._initQueueProps[n]; }
			if (v0 == (v1=p1[n]) || ratio == 0 || ratio == 1 || (typeof(v0) != "number")) {
				// no interpolation - either at start, end, values don't change, or the value is non-numeric.
				if (ratio == 1) { v0 = v1; }
			} else {
				v0 += (v1-v0)*ratio;
			}
			this._target[n] = map && map[n] ? v0+map[n] : v0;
		}
		
	}
	
	/**
	 * @method _runActions
	 * @protected
	 **/
	p._runActions = function(startPos, endPos, includeStart) {
		// TODO: Test: there may be a bug that causes actions at the start of a looping tween to be ignored.
		var sPos = startPos;
		var ePos = endPos;
		var i = -1;
		var j = this._actions.length;
		var k = 1;
		if (startPos > endPos) {
			// running backwards, flip everything:
			sPos = endPos;
			ePos = startPos;
			i = j;
			j = k = -1;
		}
		while ((i+=k) != j) {
			var action = this._actions[i];
			var pos = action.t;
			if ( (pos > sPos && pos <= ePos) || (includeStart && pos == startPos) ) {
				action.f.apply(action.o, action.p);
			}
		}
	}

	/**
	 * @method _appendQueueProps
	 * @protected
	 **/
	p._appendQueueProps = function(o) {
		if (this._css) { var map = this.cssSuffixMap || Tween.cssSuffixMap; }
		var sfx0,sfx1;
		for (var n in o) {
			if (this._initQueueProps[n] == null) {
				if (map && (sfx0 = map[n]) != null) {
					// css string.
					var str = this._target[n];
					var i = str.length-sfx0.length;
					if ((sfx1 = str.substr(i)) != sfx0) {
						throw("TweenJS Error: Suffixes do not match. ("+sfx0+":"+sfx1+")");
					} else {
						this._initQueueProps[n] = parseInt(str.substr(0,i));
					}
				} else {
					this._initQueueProps[n] = this._target[n];
				}
			}
			this._curQueueProps[n] = o[n];
		}
		return this._curQueueProps;
	}

	/**
	 * @method _cloneProps
	 * @protected
	 **/
	p._cloneProps = function(props) {
		var o = {};
		for (var n in props) {
			o[n] = props[n];
		}
		return o;
	}

	/**
	 * @method _addStep
	 * @protected
	 **/
	p._addStep = function(o) {
		if (o.d > 0) {
			this._steps.push(o);
			o.t = this.duration;
			this.duration += o.d;
		}
		return this;
	}
	
	/**
	 * @method _addAction
	 * @protected
	 **/
	p._addAction = function(o) {
		o.t = this.duration;
		this._actions.push(o);
		return this;
	}

	/**
	 * @method _set
	 * @protected
	 **/
	p._set = function(props,o) {
		for (var n in props) {
			o[n] = props[n];
		}
	}
	
window.Tween = Tween;
}(window));
