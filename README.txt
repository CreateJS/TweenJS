TWEENJS LIBRARY:
****************************************************************************************************

TweenJS is a simple tweening library for use in Javascript. It was developed to integrate well with the EaselJS library, but is not dependent on it (though it uses the same Ticker class by default).

It provides a simple but powerful API, making it easy to create very complex tweens by chaining commands. For example, the following code will create a new tween instance that calls the onStart function, tweens the target to an x value of 300 over 400ms, waits 500 ms, then tweens the target's alpha to 0 over 1s, then sets it's visible to false, and calls the onComplete function.

var myTween = Tween.get(myTarget).call(onStart).to({x:300},400).wait(500).to({alpha:0},1000).set({visible:false}).call(onComplete);

Tweens are composed of two elements: steps and actions.

Steps define the tweened numeric properties and always have a duration associated with them (even if that duration is 0). Steps are defined with the "to", "from" and "wait" methods. Steps are entirely deterministic. You can arbitrarily set a tween's position, and they will always set the same properties for that position.

Actions do not have a duration, and are executed between steps. They are defined with the "call", "set", "play", and "pause" methods. They are guaranteed to execute in the correct order, but not at the precise moment in time that they is indicated in the sequence. This can lead to indeterminate results, especially when tweens are interacting via the play and pause actions.

This library is pre-alpha. It is untested, and very likely to change substantially as it matures.
