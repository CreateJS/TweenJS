/**
 * @license Ease
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2017 gskinner.com, inc.
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
 * The Ease class provides a collection of easing functions for use with TweenJS. It does not use the standard 4 param
 * easing signature. Instead it uses a single param which indicates the current linear ratio (0 to 1) of the tween.
 *
 * Most methods on Ease can be passed directly as easing functions:
 *
 *      Tween.get(target).to({x:100}, 500, Ease.linear);
 *
 * However, methods beginning with "get" will return an easing function based on parameter values:
 *
 *      Tween.get(target).to({y:200}, 500, Ease.getPowIn(2.2));
 *
 * Please see the <a href="http://www.createjs.com/Demos/TweenJS/Tween_SparkTable">spark table demo</a> for an
 * overview of the different ease types on <a href="http://tweenjs.com">TweenJS.com</a>.
 *
 * <em>Equations derived from work by Robert Penner.</em>
 *
 * @memberof tweenjs
 * @module Ease
 */

/**
 * @param {Number} t
 * @return {Number}
 */
export function linear (t) {
	return t;
}

/**
 * Mimics the simple -100 to 100 easing in Flash Pro.
 * @param {Number} amount A value from -1 (ease in) to 1 (ease out) indicating the strength and direction of the ease.
 * @return {Function}
 */
export function get (amount) {
	if (amount < -1) { amount = -1; } else if (amount > 1) { amount = 1; }
	return function (t) {
		if (amount == 0) { return t; }
		if (amount < 0) { return t * (t * -amount + 1 + amount); }
		return t * ((2 - t) * amount + (1 - amount));
	};
}

/**
 * Configurable exponential ease.
 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
 * @return {Function}
 */
export function getPowIn (pow) {
	return function (t) {
		return Math.pow(t, pow);
	};
}

/**
 * Configurable exponential ease.
 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
 * @return {Function}
 */
export function getPowOut (pow) {
	return function (t) {
		return 1 - Math.pow(1 - t, pow);
	};
}

/**
 * Configurable exponential ease.
 * @param {Number} pow The exponent to use (ex. 3 would return a cubic ease).
 * @return {Function}
 */
export function getPowInOut (pow) {
	return function (t) {
		if ((t *= 2) < 1) return 0.5 * Math.pow(t, pow);
		return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
	};
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function sineIn (t) {
	return 1 - Math.cos(t * Math.PI / 2);
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function sineOut (t) {
	return Math.sin(t * Math.PI / 2);
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function sineInOut (t) {
	return -0.5 * (Math.cos(Math.PI * t) - 1);
}

/**
 * Configurable "back in" ease.
 * @param {Number} amount The strength of the ease.
 * @return {Function}
 */
export function getBackIn (amount) {
	return function (t) {
		return t * t * ((amount + 1) * t - amount);
	};
}

/**
 * Configurable "back out" ease.
 * @param {Number} amount The strength of the ease.
 * @return {Function}
 */
export function getBackOut (amount) {
	return function (t) {
		return (--t * t * ((amount + 1) * t + amount) + 1);
	};
}

/**
 * Configurable "back in out" ease.
 * @param {Number} amount The strength of the ease.
 * @return {Function}
 */
export function getBackInOut (amount) {
	amount *= 1.525;
	return function (t) {
		if ((t *= 2) < 1) return 0.5 * (t * t * ((amount + 1) * t - amount));
		return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
	};
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function circIn (t) {
	return -(Math.sqrt(1 - t * t) - 1);
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function circOut (t) {
	return Math.sqrt(1 - --t * t);
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function circInOut (t) {
	if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
	return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function bounceIn (t) {
	return 1 - Ease.bounceOut(1 - t);
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function bounceOut (t) {
	if (t < 1 / 2.75) {
		return 7.5625 * t * t;
	} else if (t < 2 / 2.75) {
		return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
	} else if (t < 2.5 / 2.75) {
		return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
	} else {
		return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
	}
}

/**
 * @param {Number} t
 * @return {Number}
 */
export function bounceInOut (t) {
	if (t < 0.5) return Ease.bounceIn(t * 2) * 0.5;
	return Ease.bounceOut(t * 2 - 1) * 0.5 + 0.5;
}

/**
 * Configurable elastic ease.
 * @param {Number} amplitude
 * @param {Number} period
 * @return {Function}
 */
export function getElasticIn (amplitude, period) {
	let pi2 = Math.PI * 2;
	return function (t) {
		if (t === 0 || t === 1) return t;
		let s = period / pi2 * Math.asin(1 / amplitude);
		return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
	};
}

/**
 * Configurable elastic ease.
 * @param {Number} amplitude
 * @param {Number} period
 * @return {Function}
 */
export function getElasticOut (amplitude, period) {
	let pi2 = Math.PI * 2;
	return function (t) {
		if (t === 0 || t === 1) return t;
		let s = period / pi2 * Math.asin(1 / amplitude);
		return amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1;
	};
}

/**
 * Configurable elastic ease.
 * @param {Number} amplitude
 * @param {Number} period
 * @return {Function}
 */
export function getElasticInOut (amplitude, period) {
	let pi2 = Math.PI * 2;
	return function (t) {
		let s = period / pi2 * Math.asin(1 / amplitude);
		if ((t *= 2) < 1) return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
		return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * 0.5 + 1;
	};
}

/**
 * Identical to linear.
 * @param {Number} t
 * @return {Number}
 */
export const none = linear;
/**
 * @param {Number} t
 * @return {Number}
 */
export const quadIn = getPowIn(2);
/**
 * @param {Number} t
 * @return {Number}
 */
export const quadOut = getPowOut(2);
/**
 * @param {Number} t
 * @return {Number}
 */
export const quadInOut = getPowInOut(2);
/**
 * @param {Number} t
 * @return {Number}
 */
export const cubicIn = getPowIn(3);
/**
 * @param {Number} t
 * @return {Number}
 */
export const cubicOut = getPowOut(3);
/**
 * @param {Number} t
 * @return {Number}
 */
export const cubicInOut = getPowInOut(3);
/**
 * @param {Number} t
 * @return {Number}
 */
export const quartIn = getPowIn(4);
/**
 * @param {Number} t
 * @return {Number}
 */
export const quartOut = getPowOut(4);
/**
 * @param {Number} t
 * @return {Number}
 */
export const quartInOut = getPowInOut(4);
/**
 * @param {Number} t
 * @return {Number}
 */
export const quintIn = getPowIn(5);
/**
 * @param {Number} t
 * @return {Number}
 */
export const quintOut = getPowOut(5);
/**
 * @param {Number} t
 * @return {Number}
 */
export const quintInOut = getPowInOut(5);
/**
 * @param {Number} t
 * @return {Number}
 */
export const backIn = getBackIn(1.7);
/**
 * @param {Number} t
 * @return {Number}
 */
export const backOut = getBackOut(1.7);
/**
 * @param {Number} t
 * @return {Number}
 */
export const backInOut = getBackInOut(1.7);
/**
 * @param {Number} t
 * @return {Number}
 */
export const elasticIn = getElasticIn(1, 0.3);
/**
 * @param {Number} t
 * @return {Number}
 */
export const elasticOut = getElasticOut(1, 0.3);
/**
 * @param {Number} t
 * @return {Number}
 */
export const elasticInOut = getElasticInOut(1, 0.3 * 1.5);
