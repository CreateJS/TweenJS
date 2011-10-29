TWEENJS LIBRARY:
****************************************************************************************************

TweenJS is a simple tweening library for use in Javascript. It was developed to integrate well with the EaselJS library, but is not dependent on or specific to it (though it uses the same Ticker class by default). It supports tweening of both numeric object properties & CSS style properties.

The API is simple but very powerful, making it easy to create complex tweens by chaining commands.

var tween = Tween.get(myTarget).to({x:300},400).set({label:"hello!"}).wait(500).to({alpha:0,visible:false},1000).call(onComplete);

The example above will create a new tween instance that:
- tweens the target to an x value of 300 over 400ms and sets its label to "hello!"
- waits 500 ms
- tweens the target's alpha to 0 over 1s & sets its visible to false
- calls the onComplete function

Tweens are composed of two elements: steps and actions.

Steps define the tweened properties and always have a duration associated with them (even if that duration is 0). Steps are defined with the "to" and "wait" methods. Steps are entirely deterministic. You can arbitrarily set a tween's position, and it will always set the same properties for that position.

Actions do not have a duration, and are executed between steps. They are defined with the "call", "set", "play", and "pause" methods. They are guaranteed to execute in the correct order, but not at the precise moment in time that is indicated in the sequence. This can lead to indeterminate results, especially when tweens are interacting via the play and pause actions.

This library is currently alpha. It has been tested (though not extensively), and is likely to change somewhat as it matures.

Tweens support a number of configuration properties, which are specified as the second param when creating a new tween:
Tween.get(target, {loop:true, useTicks:true, css:true, ignoreGlobalPause:true}).to(etc...);

All configuration properties default to false. The properties are:
loop - indicates whether the tween should loop when it reaches the end
useTicks - the tween will use ticks for duration instead of milliseconds
css - enables css mapping for some css properties
ignoreGlobalPause - the tween will continue ticking even when Ticker is paused.

When using Tween.get, you can also specify true as the third parameter to override any active tweens on the target.
Tween.get(target,null,true); // this will remove any existing tweens on the target.

--
Special thanks to Robert Penner for his easing equations, which form the basis for the Ease class.
