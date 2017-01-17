/*
* Transitions by Chris Martindale. Aug 12, 2011
*
*
* Copyright (c) 2011 Chris Martindale
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
* Class of easing/linear animation transitioning functions. The linear(non-easing)/easing
* functions can be used independently of one another, or a linear function
* can be passed as an argument to an easing function. Simply pass a transition
* function to the ease argument in a Tween step and watch it go.
* example: 
* Tween.get(shape).to({x:100},1000,Transition.ease.in)
* .to({y:100},1000,Transition.ease.in(Transition.bounce))
* .to({x:1},1000,Transition.elastic)
* .to({y:1},1000,Transition.ease.inout(Transition.cubic));
* @class Transitions
* @constructor
**/
Transition = function() { return this; };

Transition.quad = function(progress) { return Math.pow(progress, 2); }  

Transition.cubic = function(progress) { return Math.pow(progress, 3); } 

Transition.quart = function(progress) { return Math.pow(progress, 4); } 

Transition.quint = function(progress) { return Math.pow(progress, 5); } 

Transition.circ = function(progress) { return 1 - Math.sin(Math.acos(progress)); }

Transition.sine = function(progress) { return 1 - Math.cos(progress * Math.PI / 2); }

Transition.bow = function(progress) { return Math.pow(progress, 2) * ((2 + 1) * progress - 2); }

Transition.bounce = function(progress) {
	for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
		if (progress >= (7 - 4 * a) / 11) {
			return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)
	    	}	
	}
}

Transition.elastic = function(progress) { return Math.pow(2, 10 * --progress) * Math.cos(20 * progress * Math.PI * (2 && 2[0] || 1) / 3); }

var ease = Transition.ease = function() { return this; }

ease.in = function(transition) { 
	if(transition) {
		if(typeof(transition) == "function") {
			return function(progress) { 
				return transition(progress) 
			}
		} 
	} 
	var progress = transition;
	return Transition.quad(progress);
}

ease.out = function(transition) {
	if(transition) {	
		if(typeof(transition) == "function") {
			return function(progress) { 
				return 1 - transition(1 - progress) 
			}
		}	 
	}
	var progress = transition;
	return 1 - Transition.quad(1 - progress);
}

ease.inout = function(transition) {
	if(transition) {
		if(typeof(transition) == "function") {
			return function(progress) {
				if(progress < .5) {
					return transition(progress)	
				} else { return 1 - transition(1 - progress) }
			}
		}
		var progress = transition;
		if(progress < .5) {
			return Transition.quad(2*progress) / 2
		} else { return (2 - Transition.quad(2*(1 - progress))) / 2 }
	} 
}

window.Transition = Transition;
}(window));