/**
 * @license RelativePlugin
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
 * The RelativePlugin for TweenJS enables relative numeric values for tweens. Install using:
 *
 * 	RotationPlugin.install();
 *
 * Once installed, you can pass in relative numeric property values as strings beginning with "+" or "-". For example,
 * the following tween would tween the x position of `foo` from its initial value of `200` to `50` (200-150), then to
 * `125` (50+75).
 *
 * 	foo.x = 200;
 * 	Tween.get(foo).to({x:"-150"}, 500).to({x:"+75"}, 500);
 *
 * @memberof tweenjs
 * @static
 */
class RelativePlugin {

	constructor () {
		throw "RelativePlugin is static and cannot be instantiated.";
	}

  /**
   * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
   * @static
   */
  static install (props) {

  }

	/**
	 * Called by TweenJS when a new property initializes on a tween.
	 *
	 * @see tweenjs.SamplePlugin#init
	 * @static
	 *
	 * @param {Tween} tween
	 * @param {String} prop
	 * @param {any} value
	 * @return {any}
	 */
  static init (tween, prop, value) {
    if (!tween.pluginData.Relative_disabled) { tween._addPlugin(RelativePlugin); }
  }

	/**
	 * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
	 *
	 * @see tweenjs.SamplePlug#step
	 * @static
	 *
	 * @param {Tween} tween
	 * @param {TweenStep} step
	 * @param {Object} props
	 */
  static step (tween, step, prop) {
    // in this method we check if any prop is a string value starting with "+" or "-", and adjust the value accordingly.
    for (let n in props) {
      let value = props[n];
      if (typeof value !== "string") { continue; }
      let prev = step.prev.props[n], char0 = value[0];
      if (!(char0 === "+" || char0 === "-") || isNaN(value = +value + prev)) { continue; }
      step.props[n] = value;
    }
  }

	/**
	 * Called before a property is updated by the tween.
	 *
	 * @see tweenjs.SamplePlugin#change
	 * @static
	 *
	 * @param {Tween} tween
	 * @param {TweenStep} step
	 * @param {String} prop
	 * @param {any} value
	 * @param {Number} ratio
	 * @param {Boolean} end
	 * @return {any}
	 */
  static change (tween, step, prop, value, ratio, end) {
    // nothing
  }

}

/**
 * A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
 * @type {string}
 * @static
 * @readonly
 */
RelativePlugin.ID = "Relative";

export { RelativePlugin };
