### 2.0 BETA

This branch is in beta. Reporting issues is appreciated, please mention that it is for 2.0 in the issue body.

TweenJS is currently not on NPM. To use 2.0 in your projects, install with the git commit-ish syntax `npm install github:createjs/tweenjs#2.0`

Unit tests failing is a known issue, please don't report this.

Plugin architecture is incomplete, as such they are expected to break.

<p align="center">
  <a href="https://createjs.com/tweenjs">
    <img alt="tweenjs" src="https://raw.githubusercontent.com/createjs/tweenjs/2.0/assets/github-header.png" width="546">
  </a>
</p>

TweenJS is a simple tweening library for use in JavaScript. It was developed to integrate well with the EaselJS library, but is not dependent on or specific to it (though it uses the same Ticker and Event classes by default). It supports tweening of both numeric object properties & CSS style properties.

## Example
The API is simple but very powerful, making it easy to create complex tweens by chaining commands.

```javascript
import { Tween } from "@createjs/tweenjs";
let tween = Tween.get(target)
	.to({ x: 300 }, 400)
	.set({ label: "hello!" })
	.wait(500)
	.to({ alpha: 0, visible: false }, 1000)
	.call((p1, p2) => { ... }, [ 10, true ]); // p1 === 10, p2 === true, this === target
```

The example above will create a new Tween instance that:

- tweens the target to an x value of 300 over 400ms and sets its label to "hello!"
- waits 500 ms
- tweens the target's alpha to 0 over 1s & sets its visible to false
- calls the onComplete function

Tweens are composed of two elements: steps and actions.

Steps define the tweened properties and always have a duration associated with them (even if that duration is 0). Steps are defined with the "to" and "wait" methods. Steps are entirely deterministic. You can arbitrarily set a tween's position, and it will always set the same properties for that position.

Actions do not have a duration, and are executed between steps. They are defined with the `call()`, `set()`, `play()`, and `pause()` methods. They are guaranteed to execute in the correct order, but not at the precise moment in time that is indicated in the sequence. This can lead to indeterminate results, especially when tweens are interacting via the play and pause actions.

Tweens support a number of configuration properties, which are specified as the second param when creating a new tween:

```javascript
Tween.get(target, {
	loop: true,
	useTicks: true,
	css: true,
	ignoreGlobalPause: true
}).to(etc...);
```

All configuration properties default to false. The properties are:

`loop` - indicates whether the tween should loop when it reaches the end

`useTicks` - the tween will use ticks for duration instead of milliseconds

`css` - enables css mapping for some css properties

`ignoreGlobalPause` - the tween will continue ticking even when Ticker is paused.

When using `Tween.get()`, you can also specify true as the third parameter to override any active tweens on the target.

```javascript
Tween.get(target, null, true); // this will remove any existing tweens on the target.
```

## Support and Resources
- Find examples and more information at the [TweenJS web site](http://createjs.com/tweenjs).
- Read the [documentation](http://createjs.com/tweenjs/docs).
- Discuss, share projects, and interact with other users on [reddit](http://www.reddit.com/r/createjs/).
- Ask technical questions on [Stack Overflow](http://stackoverflow.com/questions/tagged/tweenjs).
- File verified bugs or formal feature requests using Issues on [GitHub](https://github.com/createjs/tweenjs/issues).
- There is a [Google Group](http://groups.google.com/group/createjs-discussion) for discussions and support.
- Have a look at the included [examples](https://github.com/createjs/tweenjs/tree/master/examples) for more in-depth instructions.

It was built by [gskinner.com](http://www.gskinner.com), and is released for free under the MIT license, which means you can use it for almost any purpose (including commercial projects). We appreciate credit where possible, but it is not a requirement.

## Thanks
Special thanks to [Robert Penner](http://flashblog.robertpenner.com/) for his easing equations, which form the basis for the Ease class.
