/**
 * @license CSSPlugin
 * Visit http://createjs.com for documentation, updates and examples.
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

var createjs = (function (exports) {
'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/*
* CSSPlugin
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
 * A TweenJS plugin for working with numeric CSS string properties (ex. top, left). To use simply install after
 * TweenJS has loaded:
 *
 *     createjs.CSSPlugin.install();
 *
 * CSSPlugin works with almost any style property or unit. It identifies CSS values by looking for an initial value
 * on the element's `style` object. It also uses this initial value to parse out the units to use with that value.
 *
 * In the following example, `top` would be tweened as a style using `em` units using CSSPlugin, but `width`
 * would be not be tweened as a style (because there is no initial inline style value for it).
 *
 *     myEl.style.top = "10em";
 *     createjs.Tween.get(myEl).to({top:20, width:100}, 1000);
 *
 * CSSPlugin can also use computed styles. Please see {{#crossLink "AbstractTween/compute:property"}}{{/crossLink}}
 * for more information.
 *
 * CSSPlugin has specific handling for the `transform` style, and will tween any transforms as long as their operations
 * and units match. For example:
 *
 *     myEl.style.transform = "translate(20px, 30px)";
 *     createjs.Tween.get(myEl)
 *         .to({transform: "translate(40px, 50px)"}, 900) // would be tweened, everything matches
 *         .to({transform: "translate(5em, 300px)"}, 900) // would NOT be tweened, different units (px vs em)
 *         .to({transform: "scaleX(2)"}, 900) // would NOT be tweened, different operations (translate vs rotate)
 *
 * You can also use `*` to copy the operation at that position from the previous transform.
 *
 *     myEl.style.transform = "translate(0px, 0px) rotate(0deg)";
 *     createjs.Tween.get(myEl)
 *         .to({transform: "translate(50px, 50px) *"}, 900) // would copy the "rotate" operation
 *         .to({transform: "* rotate(90deg)"}, 900) // would copy the "translate" operation
 *
 * Please note that the CSS Plugin is not included in the TweenJS minified file.
 * @class CSSPlugin
 * @module TweenJS
 * @static
 */

var CSSPlugin = function () {

  // constructor:
  /**
   * @constructor
   */
  function CSSPlugin() {
    classCallCheck(this, CSSPlugin);

    throw "CSSPlugin is static and cannot be instanitated.";
  }

  // static methods
  /**
   * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
   * @method install
   * @static
   */


  CSSPlugin.install = function install(props) {};

  /**
   * Called by TweenJS when a new property initializes on a tween.
    * See {{#crossLink "SamplePlugin/init"}}{{/crossLink}} for more info.
    * @method init
    * @param {Tween} tween
    * @param {String} prop
    * @param {any} value
    * @return {any}
    * @static
   */


  CSSPlugin.init = function init(tween, prop, value) {
    var data = tween.pluginData;
    if (data.CSS_disabled || !(tween.target instanceof HTMLElement)) {
      return;
    }
    var initVal = value || getStyle(tween.target, prop, data.CSS_compute);
    if (initVal === undefined) {
      return;
    }

    tween._addPlugin(CSSPlugin);

    var cssData = data.CSS || (data.CSS = {});
    if (prop === "transform") {
      cssData[prop] = "";
      return parseTransform(initVal);
    }

    var result = s.VALUE_RE.exec(initVal);
    if (result === null) {
      // a string we can't handle numerically, so add it to the CSSData without a suffix.
      cssData[prop] = "";
      return initVal;
    } else {
      cssData[prop] = result[2];
      return parseFloat(result[1]);
    }
  };

  /**
    * Called when a new step is added to a tween (ie. a new "to" action is added to a tween).
    * See {{#crossLink "SamplePlugin/step"}}{{/crossLink}} for more info.
    * @method step
    * @param {Tween} tween
    * @param {TweenStep} step
    * @param {Object} props
   * @static
   */


  CSSPlugin.step = function step(tween, _step, props) {
    if (props.transform) {
      _step.props.transform = parseTransform(_step.props.transform, _step.prev.props.transform);
    }
  };

  /**
    * Called before a property is updated by the tween.
    * See {{#crossLink "SamplePlugin/change"}}{{/crossLink}} for more info.
    * @method change
    * @param {Tween} tween
    * @param {TweenStep} step
    * @param {String} prop
    * @param {any} value
    * @param {Number} ratio
    * @param {Boolean} end
    * @return {any}
   * @static
   */


  CSSPlugin.change = function change(tween, step, prop, value, ratio, end) {
    var sfx = tween.pluginData.CSS[prop];
    if (sfx === undefined) {
      return;
    }
    if (prop === "transform") {
      value = writeTransform(step.prev.props.transform, step.props.transform, ratio);
    }
    tween.target.style[prop] = value + sfx;
    return Tween.IGNORE;
  };

  return CSSPlugin;
}();

CSSPlugin.priority = 100; // high priority, should read first and write last

/**
 * A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
 * @property ID
 * @type {String}
 * @static
 * @readonly
 */
CSSPlugin.ID = "CSS";

/**
 * Extracts the numeric value and suffix from a single CSS value.
 * @property VALUE_RE
 * @type {RegExp}
 * @static
 * @readonly
 */
CSSPlugin.VALUE_RE = /^(-?[\d.]+)([a-z%]*)$/;

/**
 * Extracts the numeric value and suffix from comma delimited lists.
 * @property TRANSFORM_VALUE_RE
 * @type {RegExp}
 * @static
 * @readonly
 */
CSSPlugin.TRANSFORM_VALUE_RE = /(-?[\d.]+)([a-z%]*),?\s*/g;

/**
 * Extracts the components of a transform.
 * @property TRANSFORM_RE
 * @type {RegExp}
 * @static
 * @readonly
 */
CSSPlugin.TRANSFORM_RE = /(\w+?)\(([^)]+)\)|(?:^|\s)(\*)(?:$|\s)/g;

/**
 * By default, CSSPlugin uses only inline styles on the target element (ie. set via the style attribute, `style` property, or `cssText`)
 * to determine which properties should be tweened via CSS, and what units to use.
 *
 * Setting `compute` to `true` causes CSSPlugin to use `getComputedStyle` for this purpose. This has the advantage of
 * including all styles that effect the target element, however there are some important considerations for its use:<UL>
 *     <LI> `getComputedStyle` is computationally expensive, which could lead to performance issues if you are creating a large
 *     number of tweens at once.
 *     <LI> styles are normalized. For example, a width value specified as a `%` may be computed as `px`, which CSSPlugin will
 *     use for the tween. Different browsers _may_ normalize values differently.
 *     <LI> there are a large number of computed styles, which increases the chance that a property will be identified as a style.
 *     <LI> does not work with IE8 or below.
 *     </UL>
 *
 *     The `compute` setting can be overridden on a per-tween basis by setting `tween.pluginData.CSS_compute`. For example,
 *     to enable computed styles for a new tween, you could use:
 *
 *         createjs.Tween.get(el, {pluginData:{CSS_compute:true}}).to({top:20}, 1000);
 *
 *     Given the considerations for `compute`, it is recommended that you keep the default global setting of `false` and override it
 *     in specific cases via `pluginData`.
 * @property compute
 * @type {Boolean}
 * @default false
 * @static
 */
CSSPlugin.compute = false;

// private helper methods:
function getStyle(target, prop, compute) {
  if (compute || compute == null && CSSPlugin.compute) {
    return window.getComputedStyle(target)[prop];
  } else {
    return target.style[prop];
  }
}

function parseTransform(str, compare) {
  var result = void 0,
      valStr = void 0,
      list = [false, str];
  do {
    // pull out the next "component" of the transform (ex. "translate(10px, 20px)")
    result = CSSPlugin.TRANSFORM_RE.exec(str);
    if (!result) {
      break;
    }
    if (result[3] === "*") {
      // reuse previous value:
      list.push(compare[list.length]);
      continue;
    }
    var component = [result[1]],
        compareComp = compare && compare[list.length];

    // check that the operation type matches (ex. "translate" vs "rotate"):
    if (compare && (!compareComp || component[0] !== compareComp[0])) {
      compare = null;console.log("transforms don't match: ", component[0], compareComp[0]);
    } // component doesn't match

    valStr = result[2];
    do {
      // pull out the next value (ex. "20px", "12.4rad"):
      result = CSSPlugin.TRANSFORM_VALUE_RE.exec(valStr);
      if (!result) {
        break;
      }
      component.push(+result[1], result[2]);

      // chack that the units match (ex. "px" vs "em"):
      if (compare && compareComp[component.length - 1] !== result[2]) {
        compare = null;console.log("transform units don't match: ", component[0], compareComp[component.length - 1], result[2]);
      } // unit doesn't match
    } while (true);

    list.push(component);
  } while (true);

  list[0] = !!compare;
  return list;
}

function writeTransform(list0, list1, ratio) {
  // check if we should just use the original transform strings:
  // TODO: do we want to worry about how this works with bounce eases & ratio>1?
  if (ratio === 1) {
    return list1[1];
  }
  if (ratio === 0 || !list1[0]) {
    return list0[1];
  }

  // they match, we want to apply the ratio:
  var str = "";
  for (var i = 2, l = list0.length; i < l; i++) {
    var component0 = list0[i],
        component1 = list1[i];
    str += component0[0] + "(";
    for (var _i = 1, _l = component0.length; _i < _l; _i += 2) {
      str += component0[_i] + (component1[_i] - component0[_i]) * ratio + component0[_i + 1];
      if (_i < _l - 2) {
        str += ", ";
      }
    }
    str += ")";
    if (i < l - 1) {
      str += " ";
    }
  }
  return str;
}

/*
// this method is really only needed for roundtrip tests.
function writeSingleTransform (list) {
  let str = "";
  for (let i = 2, l = list.length; i < l; i++) {
    let component = list[i];
    str += `${component[0]}(`;
    for (let i = 1, l = component.length; i < l; i += 2) {
      str += component[i]+component[i+1];
      if (i < l-2) { str += ", "; }
    }
    str += ")";
    if (i < l-1) { str += " "; }
  }
  return str;
}
*/

exports.CSSPlugin = CSSPlugin;

return exports;

}({}));
