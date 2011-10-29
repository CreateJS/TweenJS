/*
* Ease by Grant Skinner. Oct 27, 2011
* Visit http://easeljs.com/ for documentation, updates and examples.
*
* Equations derived from work by Robert Penner.
*
* Copyright (c) 2011 Grant Skinner
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
* The Tween Javascript library provides a retained graphics mode for canvas 
* including a full, hierarchical display list, a core interaction model, and 
* helper classes to make working with Canvas much easier.
* @module TweenJS
**/


(function(window) {

// constructor:
/**
 * The Ease class provides a small collection of easing functions for use with TweenJS.
 * It does not use the standard 4 param easing signature. Instead it uses a single param
 * which indicates the current linear ratio (0 to 1) of the tween.
 * @class Ease
 * @static
 **/
var Ease = function() {
	throw "Ease cannot be instantiated.";
}

// public static methods:
	
	Ease.get = function(amount) {
		if (amount < -1) { amount = -1; }
		if (amount > 1) { amount = 1; }
		return function(n) {
			if (amount==0) { return n; }
			if (amount<0) { return n*(n*-amount+1+amount); }
			return n*((2-n)*amount+(1-amount));
		}
	}
	
	
	Ease.getPowIn = function(pow) {
		return function(n) {
			return Math.pow(n,pow);
		}
	}
	
	Ease.getPowOut = function(pow) {
		return function(n) {
			return 1-Math.pow(1-n,pow);
		}
	}
	
	Ease.getPowInOut = function(pow) {
		return function(n) {
			if ((n*=2)<1) return 0.5*Math.pow(n,pow);
			return 1-0.5*Math.abs(Math.pow(2-n,pow));
		}
	}
	
	
	Ease.cubeIn = function(n) {
		return n*n*n;
	}
	
	Ease.cubeOut = function(n) {
		return 1-(n=1-n)*n*n;
	}
	
	Ease.cubeInOut = function(n) {
		if ((n*=2)<1) return n*n*n*0.5;
		return 0.5*((n-=2)*n*n+2);
	}
	
	
	Ease.quadIn = function(n) {
		return n*n;
	}
	
	Ease.quadOut = function(n) {
		return 1-(n=1-n)*n;
	}
	
	Ease.quadInOut = function(n) {
		if ((n*=2)<1) return 0.5*n*n;
		return -0.5*(--n*(n-2)-1);
	}
	
	
	Ease.sineIn = function(n) {
		return 1-Math.cos(n*Math.PI/2);
	}
	
	Ease.sineOut = function(n) {
		return Math.sin(n*Math.PI/2);
	}
	
	Ease.sineInOut = function(n) {
		return -0.5*(Math.cos(Math.PI*n) - 1)
	}
	
	
	Ease.getBackIn = function(amount) {
		return function(n) {
			return n*n*((amount+1)*n-amount);
		}
	}
	Ease.backIn = Ease.getBackIn(1.7);
	
	Ease.getBackOut = function(amount) {
		return function(t) {
			return (--t*t*((amount+1)*t + amount) + 1);
		}
	}
	Ease.backOut = Ease.getBackOut(1.7);
	
	Ease.getBackInOut = function(amount) {
		amount*=1.525;
		return function(t) {
			if ((t*=2)<1) return 0.5*(t*t*((amount+1)*t-amount));
			return 0.5*((t-=2)*t*((amount+1)*t+amount)+2);
		}
	}
	Ease.backInOut = Ease.getBackInOut(1.7);
	
	
	Ease.circIn = function(t) {
		return -(Math.sqrt(1-t*t)- 1);
	}
	
	Ease.circOut = function(t) {
		return Math.sqrt(1-(--t)*t);
	}
	
	Ease.circInOut = function(t) {
		if ((t*=2) < 1) return -0.5*(Math.sqrt(1-t*t)-1);
		return 0.5*(Math.sqrt(1-(t-=2)*t)+1);
	}
	
	Ease.bounceIn = function(t) {
		return 1-Ease.bounceOut(1-t);
	}
	
	Ease.bounceOut = function(t) {
		if (t < 1/2.75) {
			return (7.5625*t*t);
		} else if (t < 2/2.75) {
			return (7.5625*(t-=1.5/2.75)*t+0.75);
		} else if (t < 2.5/2.75) {
			return (7.5625*(t-=2.25/2.75)*t+0.9375);
		} else {
			return (7.5625*(t-=2.625/2.75)*t +0.984375);
		}
	}
	
	Ease.bounceInOut = function(t) {
		if (t<0.5) return Ease.bounceIn (t*2) * .5;
		return Ease.bounceOut(t*2-1)*0.5+0.5;
	}
	
	
	Ease.getElasticIn = function(amplitude,period) {
		var pi2 = Math.PI*2;
		return function(t) {
			if (t==0 || t==1) return t;
			var s = period/pi2*Math.asin(1/amplitude);
			return -(amplitude*Math.pow(2,10*(t-=1))*Math.sin((t-s)*pi2/period));
		}
	}
	Ease.elasticIn = Ease.getElasticIn(1,0.3);
	
	Ease.getElasticOut = function(amplitude,period) {
		var pi2 = Math.PI*2;
		return function(t) {
			if (t==0 || t==1) return t;
			var s = period/pi2 * Math.asin(1/amplitude);
			return (amplitude*Math.pow(2,-10*t)*Math.sin((t-s)*pi2/period )+1);
		}
	}
	Ease.elasticOut = Ease.getElasticOut(1,0.3);
	
	Ease.getElasticInOut = function(amplitude,period) {
		var pi2 = Math.PI*2;
		return function(t) {
			var s = period/pi2 * Math.asin(1/amplitude);
			if ((t*=2)<1) return -0.5*(amplitude*Math.pow(2,10*(t-=1))*Math.sin( (t-s)*pi2/period ));
			return amplitude*Math.pow(2,-10*(t-=1))*Math.sin((t-s)*pi2/period)*0.5+1;
		}
	}
	Ease.elasticInOut = Ease.getElasticInOut(1,0.3*1.5);
	
window.Ease = Ease;
}(window));
