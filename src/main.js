/**
 * @license TweenJS
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
 * The TweenJS JavaScript library provides a simple but powerful tweening interface. It supports tweening of both
 * numeric object properties & CSS style properties, and allows you to chain tweens and actions together to create
 * complex sequences.
 *
 * <h4>Simple Tween</h4>
 * This tween will tween the target's alpha property from 0 to 1 for 1s then call the <code>handleComplete</code> function.
 *
 * <code>
 *   target.alpha = 0;
 *   Tween.get(target)
 *     .to({ alpha: 1 }, 1000)
 *     .call(() => {
 *       // tween complete
 *     });
 * </code>
 *
 * <strong>Arguments and Scope</strong>
 * Tween also supports a `call()` with arguments and/or a scope. If no scope is passed, then the function is called
 * anonymously (normal JavaScript behaviour). The scope is useful for maintaining scope when doing object-oriented
 * style development.
 *
 * <code>
 *   Tween.get(target)
 *     .to({ alpha: 0 })
 *     .call(handleComplete, [argument1, argument2], this);
 * </code>
 *
 * <h4>Chainable Tween</h4>
 * This tween will wait 0.5s, tween the target's alpha property to 0 over 1s, set it's visible to false, then call the
 * <code>handleComplete</code> function.
 *
 * <code>
 *   target.alpha = 1;
 *   Tween.get(target)
 *     .wait(500)
 *     .to({ alpha: 0, visible : false }, 1000)
 *     .call(() => {
 *       // tween complete
 *     });
 * </code>
 *
 * <h4>Browser Support</h4>
 * TweenJS will work in all browsers.
 *
 * @namespace tweenjs
 *
 * @example
 * import { EventDispatcher, Event } from "@createjs/core";
 * const dispatcher = new EventDispatcher();
 * dispatcher.on("myEvent", foo);
 * dispatcher.dispatchEvent(new Event("myEvent"));
 * // foo() is called.
 */

/**
 * @module tweenjs/plugins
 *
 */

/**
 * README: Export Order
 *
 * Due to some classes having circular import bindings (whether at the top of the import chain or deeper in),
 * some exports here are in reverse order (such as Tween being exported before AbstractTween).
 * This is explained here: https://github.com/rollup/rollup/issues/845#issuecomment-240277194
 */

export { default as Tween } from "./Tween";
export { default as AbstractTween } from "./AbstractTween";
export { default as Timeline } from "./Timeline";
import * as Ease from "./Ease";
export { Ease };
