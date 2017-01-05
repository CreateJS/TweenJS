/**
 * The TweenJS JavaScript library provides a simple but powerful tweening interface. It supports tweening of both
 * numeric object properties & CSS style properties, and allows you to chain tweens and actions together to create
 * complex sequences.
 *
 * <h4>Simple Tween</h4>
 * This tween will tween the target's alpha property from 0 to 1 for 1s then call the <code>handleComplete</code> function.
 *
 *	    target.alpha = 0;
 *	    createjs.Tween.get(target).to({alpha:1}, 1000).call(handleComplete);
 *	    function handleComplete() {
 *	    	//Tween complete
 *	    }
 *
 * <strong>Arguments and Scope</strong>
 * Tween also supports a `call()` with arguments and/or a scope. If no scope is passed, then the function is called
 * anonymously (normal JavaScript behaviour). The scope is useful for maintaining scope when doing object-oriented
 * style development.
 *
 *      createjs.Tween.get(target).to({alpha:0})
 *          .call(handleComplete, [argument1, argument2], this);
 *
 * <h4>Chainable Tween</h4>
 * This tween will wait 0.5s, tween the target's alpha property to 0 over 1s, set it's visible to false, then call the
 * <code>handleComplete</code> function.
 *
 *	    target.alpha = 1;
 *	    createjs.Tween.get(target).wait(500).to({alpha:0, visible:false}, 1000).call(handleComplete);
 *	    function handleComplete() {
 *	    	//Tween complete
 *	    }
 *
 * <h4>Browser Support</h4>
 * TweenJS will work in all browsers.
 *
 * @module TweenJS
 * @main TweenJS
 */

/**
 * README: Export Order
 *
 * Due to some classes having circular import bindings (whether at the top of the import chain or deeper in),
 * some exports here are in reverse order (such as Tween being exported before AbstractTween).
 * This is explained here: https://github.com/rollup/rollup/issues/845#issuecomment-240277194
 */

// re-export shared classes
export { default as EventDispatcher } from "createjs/src/events/EventDispatcher";
export { default as Event } from "createjs/src/events/Event";
export { default as Ticker } from "createjs/src/utils/Ticker";
// core
export { default as Tween } from "./Tween";
export { default as AbstractTween } from "./AbstractTween";
export { default as Timeline } from "./Timeline";
export { default as Ease } from "./Ease";
// plugins
export { default as CSSPlugin } from "./plugins/CSSPlugin";
export { default as MotionGuidePlugin } from "./plugins/MotionGuidePlugin";
export { default as RelativePlugin } from "./plugins/RelativePlugin";
export { default as RotationPlugin } from "./plugins/RotationPlugin";
export { default as SamplePlugin } from "./plugins/SamplePlugin";
// TODO: Review this version export.
// version (templated in gulpfile, pulled from package).
export const version = "<%= version %>";
