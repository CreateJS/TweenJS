/**
 * DotPlugin
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

import Tween from "./Tween";

/**
 * The RelativePlugin for TweenJS enables tweening nested properties using dot syntax.
 *
 * @example <caption>Install</caption>
 * RotationPlugin.install();
 *
 * @example <caption>To use the plugin, begin property names with `.`, such as:</caption>
 * Tween.get(target).to({ ".position.x": 20 });
 *
 * @example <caption>You can access array indexes with the same dot syntax:</caption>
 * // this would tween: foo.points[1].y
 * Tween.get(foo).to({ ".points.1.y": 30 })
 */
export default class DotPlugin {

	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 */
	static install() {
		Tween._installPlugin(DotPlugin);
	}

	/**
	 * Called by TweenJS when a new property initializes on a tween.
	 * @see {@link tweenjs.SamplePlugin.init "More info"}
	 * @method init
	 * @param {tweenjs.Tween} tween
	 * @param {String} prop
	 * @param {any} value
	 * @return {any}
	 * @static
	 */
	static init(tween, prop, value) {
		const data = tween.pluginData;
		if (data.Dot_disabled) { return; }

		// only operate on props starting with ".":
		if (prop[0] !== ".") { return; }
		tween._addPlugin(DotPlugin);

		let t = tween.target,
				arr = prop.split(".");
		for (let i = 1, l = arr.length; i < l - 1; i++) {
			if (!(t = t[arr[i]])) {
				return Tween.IGNORE;
			}
		}
		const n = arr[i],
					targetVal = t[n],
					defaultVal = value === undefined ? targetVal : value;

		data.Dot = data.Dot || {};
		data.Dot[prop] = {t, n};

		return defaultVal;
	}

	/**
	 * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
	 * @see {@link tweenjs.SamplePlugin.step "More info"}
	 * @method step
	 * @param {tweenjs.Tween} tween
	 * @param {tweenjs.TweenStep} step
	 * @param {Object} props
	 * @static
	 */
	static step(tween, step, props) {}

	/**
	 * Called before a property is updated by the tween.
	 * @see {@link tweenjs.SamplePlugin.change "More info"}
	 * @method change
	 * @param {tweenjs.Tween} tween
	 * @param {tweenjs.TweenStep} step
	 * @param {String} prop
	 * @param {*} value
	 * @param {Number} ratio
	 * @param {Boolean} end
	 * @return {*}
	 * @static
	 */
	static change(tween, step, prop, value, ratio, end) {
		const data = tween.pluginData.Dot;
		let o;
		if (!data || !(o = data[prop])) { return; }

		o.t[o.n] = value;

		return Tween.IGNORE;
	}

}

/**
 * @property priority
 * @protected
 * @static
 */
DotPlugin.priority = 100; // high priority, should read first and write last

/**
 * A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
 * @property ID
 * @type {String}
 * @static
 * @readonly
 */
DotPlugin.ID = "Dot";
