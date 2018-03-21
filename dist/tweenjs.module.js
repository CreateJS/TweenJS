/**
 * @license
 * TweenJS
 * Visit https://createjs.com for documentation, updates and examples.
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
class Event {
  constructor(type, bubbles = false, cancelable = false) {
    this.type = type;
    this.target = null;
    this.currentTarget = null;
    this.eventPhase = 0;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.timeStamp = new Date().getTime();
    this.defaultPrevented = false;
    this.propagationStopped = false;
    this.immediatePropagationStopped = false;
    this.removed = false;
  }
  preventDefault() {
    this.defaultPrevented = this.cancelable;
    return this;
  }
  stopPropagation() {
    this.propagationStopped = true;
    return this;
  }
  stopImmediatePropagation() {
    this.immediatePropagationStopped = this.propagationStopped = true;
    return this;
  }
  remove() {
    this.removed = true;
    return this;
  }
  clone() {
    const event = new Event(this.type, this.bubbles, this.cancelable);
    for (let n in this) {
      if (this.hasOwnProperty(n)) {
        event[n] = this[n];
      }
    }
    return event;
  }
  set(props) {
    for (let n in props) {
      this[n] = props[n];
    }
    return this;
  }
  toString() {
    return `[${this.constructor.name} (type=${this.type})]`;
  }
}

class EventDispatcher {
  static initialize(target) {
    const p = EventDispatcher.prototype;
    target.addEventListener = p.addEventListener;
    target.on = p.on;
    target.removeEventListener = target.off = p.removeEventListener;
    target.removeAllEventListeners = p.removeAllEventListeners;
    target.hasEventListener = p.hasEventListener;
    target.dispatchEvent = p.dispatchEvent;
    target._dispatchEvent = p._dispatchEvent;
    target.willTrigger = p.willTrigger;
  }
  constructor() {
    this._listeners = null;
    this._captureListeners = null;
  }
  addEventListener(type, listener, useCapture = false) {
    let listeners;
    if (useCapture) {
      listeners = this._captureListeners = this._captureListeners || {};
    } else {
      listeners = this._listeners = this._listeners || {};
    }
    let arr = listeners[type];
    if (arr) {
      this.removeEventListener(type, listener, useCapture);
      arr = listeners[type];
    }
    if (arr) {
      arr.push(listener);
    } else {
      listeners[type] = [ listener ];
    }
    return listener;
  }
  on(type, listener, scope = null, once = false, data = {}, useCapture = false) {
    if (listener.handleEvent) {
      scope = scope || listener;
      listener = listener.handleEvent;
    }
    scope = scope || this;
    return this.addEventListener(type, evt => {
      listener.call(scope, evt, data);
      once && evt.remove();
    }, useCapture);
  }
  removeEventListener(type, listener, useCapture = false) {
    const listeners = useCapture ? this._captureListeners : this._listeners;
    if (!listeners) {
      return;
    }
    const arr = listeners[type];
    if (!arr) {
      return;
    }
    const l = arr.length;
    for (let i = 0; i < l; i++) {
      if (arr[i] === listener) {
        if (l === 1) {
          delete listeners[type];
        } else {
          arr.splice(i, 1);
        }
        break;
      }
    }
  }
  off(type, listener, useCapture = false) {
    this.removeEventListener(type, listener, useCapture);
  }
  removeAllEventListeners(type = null) {
    if (type) {
      if (this._listeners) {
        delete this._listeners[type];
      }
      if (this._captureListeners) {
        delete this._captureListeners[type];
      }
    } else {
      this._listeners = this._captureListeners = null;
    }
  }
  dispatchEvent(eventObj, bubbles = false, cancelable = false) {
    if (typeof eventObj === "string") {
      const listeners = this._listeners;
      if (!bubbles && (!listeners || !listeners[eventObj])) {
        return true;
      }
      eventObj = new Event(eventObj, bubbles, cancelable);
    } else if (eventObj.target && eventObj.clone) {
      eventObj = eventObj.clone();
    }
    try {
      eventObj.target = this;
    } catch (e) {}
    if (!eventObj.bubbles || !this.parent) {
      this._dispatchEvent(eventObj, 2);
    } else {
      let top = this;
      const list = [ top ];
      while (top.parent) {
        list.push(top = top.parent);
      }
      const l = list.length;
      let i;
      for (i = l - 1; i >= 0 && !eventObj.propagationStopped; i--) {
        list[i]._dispatchEvent(eventObj, 1 + (i == 0));
      }
      for (i = 1; i < l && !eventObj.propagationStopped; i++) {
        list[i]._dispatchEvent(eventObj, 3);
      }
    }
    return !eventObj.defaultPrevented;
  }
  hasEventListener(type) {
    const listeners = this._listeners, captureListeners = this._captureListeners;
    return !!(listeners && listeners[type] || captureListeners && captureListeners[type]);
  }
  willTrigger(type) {
    let o = this;
    while (o) {
      if (o.hasEventListener(type)) {
        return true;
      }
      o = o.parent;
    }
    return false;
  }
  toString() {
    return `[${this.constructor.name + this.name ? ` ${this.name}` : ""}]`;
  }
  _dispatchEvent(eventObj, eventPhase) {
    const listeners = eventPhase === 1 ? this._captureListeners : this._listeners;
    if (eventObj && listeners) {
      let arr = listeners[eventObj.type];
      let l;
      if (!arr || (l = arr.length) === 0) {
        return;
      }
      try {
        eventObj.currentTarget = this;
      } catch (e) {}
      try {
        eventObj.eventPhase = eventPhase;
      } catch (e) {}
      eventObj.removed = false;
      arr = arr.slice();
      for (let i = 0; i < l && !eventObj.immediatePropagationStopped; i++) {
        let o = arr[i];
        if (o.handleEvent) {
          o.handleEvent(eventObj);
        } else {
          o(eventObj);
        }
        if (eventObj.removed) {
          this.off(eventObj.type, o, eventPhase === 1);
          eventObj.removed = false;
        }
      }
    }
  }
}

class AbstractTween extends EventDispatcher {
  constructor(props) {
    super();
    this.ignoreGlobalPause = false;
    this.loop = 0;
    this.useTicks = false;
    this.reversed = false;
    this.bounce = false;
    this.timeScale = 1;
    this.duration = 0;
    this.position = 0;
    this.rawPosition = -1;
    this._paused = true;
    this._next = null;
    this._prev = null;
    this._parent = null;
    this._labels = null;
    this._labelList = null;
    if (props) {
      this.useTicks = !!props.useTicks;
      this.ignoreGlobalPause = !!props.ignoreGlobalPause;
      this.loop = props.loop === true ? -1 : props.loop || 0;
      this.reversed = !!props.reversed;
      this.bounce = !!props.bounce;
      this.timeScale = props.timeScale || 1;
      props.onChange && this.addEventListener("change", props.onChange);
      props.onComplete && this.addEventListener("complete", props.onComplete);
    }
  }
  get labels() {
    let list = this._labelList;
    if (!list) {
      list = this._labelList = [];
      let labels = this._labels;
      for (let label in labels) {
        list.push({
          label: label,
          position: labels[label]
        });
      }
      list.sort((a, b) => a.position - b.position);
    }
    return list;
  }
  set labels(labels) {
    this._labels = labels;
    this._labelList = null;
  }
  get currentLabel() {
    let labels = this.labels;
    let pos = this.position;
    for (let i = 0, l = labels.length; i < l; i++) {
      if (pos < labels[i].position) {
        break;
      }
    }
    return i === 0 ? null : labels[i - 1].label;
  }
  get paused() {
    return this._paused;
  }
  set paused(paused) {
    Tween._register(this, paused);
    this._paused = paused;
  }
  advance(delta, ignoreActions = false) {
    this.setPosition(this.rawPosition + delta * this.timeScale, ignoreActions);
  }
  setPosition(rawPosition, ignoreActions = false, jump = false, callback) {
    const d = this.duration, loopCount = this.loop, prevRawPos = this.rawPosition;
    let loop = 0, t = 0, end = false;
    if (rawPosition < 0) {
      rawPosition = 0;
    }
    if (d === 0) {
      end = true;
      if (prevRawPos !== -1) {
        return end;
      }
    } else {
      loop = rawPosition / d | 0;
      t = rawPosition - loop * d;
      end = loopCount !== -1 && rawPosition >= loopCount * d + d;
      if (end) {
        rawPosition = (t = d) * (loop = loopCount) + d;
      }
      if (rawPosition === prevRawPos) {
        return end;
      }
      if (!this.reversed !== !(this.bounce && loop % 2)) {
        t = d - t;
      }
    }
    this.position = t;
    this.rawPosition = rawPosition;
    this._updatePosition(jump, end);
    if (end) {
      this.paused = true;
    }
    callback && callback(this);
    if (!ignoreActions) {
      this._runActions(prevRawPos, rawPosition, jump, !jump && prevRawPos === -1);
    }
    this.dispatchEvent("change");
    if (end) {
      this.dispatchEvent("complete");
    }
  }
  calculatePosition(rawPosition) {
    const d = this.duration, loopCount = this.loop;
    let loop = 0, t = 0;
    if (d === 0) {
      return 0;
    }
    if (loopCount !== -1 && rawPosition >= loopCount * d + d) {
      t = d;
      loop = loopCount;
    } else if (rawPosition < 0) {
      t = 0;
    } else {
      loop = rawPosition / d | 0;
      t = rawPosition - loop * d;
    }
    return !this.reversed !== !(this.bounce && loop % 2) ? d - t : t;
  }
  addLabel(label, position) {
    if (!this._labels) {
      this._labels = {};
    }
    this._labels[label] = position;
    const list = this._labelList;
    if (list) {
      for (let i = 0, l = list.length; i < l; i++) {
        if (position < list[i].position) {
          break;
        }
      }
      list.splice(i, 0, {
        label: label,
        position: position
      });
    }
  }
  gotoAndPlay(positionOrLabel) {
    this.paused = false;
    this._goto(positionOrLabel);
  }
  gotoAndStop(positionOrLabel) {
    this.paused = true;
    this._goto(positionOrLabel);
  }
  resolve(positionOrLabel) {
    const pos = Number(positionOrLabel);
    return isNaN(pos) ? this._labels && this._labels[positionOrLabel] : pos;
  }
  toString() {
    return `[${this.constructor.name}${this.name ? ` (name=${this.name})` : ""}]`;
  }
  clone() {
    throw "AbstractTween cannot be cloned.";
  }
  _init(props) {
    if (!props || !props.paused) {
      this.paused = false;
    }
    if (props && props.position != null) {
      this.setPosition(props.position);
    }
  }
  _goto(positionOrLabel) {
    const pos = this.resolve(positionOrLabel);
    if (pos != null) {
      this.setPosition(pos, false, true);
    }
  }
  _runActions(startRawPos, endRawPos, jump, includeStart) {
    if (!this._actionHead && !this.tweens) {
      return;
    }
    const d = this.duration, loopCount = this.loop;
    let reversed = this.reversed, bounce = this.bounce;
    let loop0, loop1, t0, t1;
    if (d === 0) {
      loop0 = loop1 = t0 = t1 = 0;
      reversed = bounce = false;
    } else {
      loop0 = startRawPos / d | 0;
      loop1 = endRawPos / d | 0;
      t0 = startRawPos - loop0 * d;
      t1 = endRawPos - loop1 * d;
    }
    if (loopCount !== -1) {
      if (loop1 > loopCount) {
        t1 = d;
        loop1 = loopCount;
      }
      if (loop0 > loopCount) {
        t0 = d;
        loop0 = loopCount;
      }
    }
    if (jump) {
      return this._runActionsRange(t1, t1, jump, includeStart);
    } else if (loop0 === loop1 && t0 === t1 && !jump && !includeStart) {
      return;
    } else if (loop0 === -1) {
      loop0 = t0 = 0;
    }
    const dir = startRawPos <= endRawPos;
    let loop = loop0;
    do {
      let rev = !reversed !== !(bounce && loop % 2);
      let start = loop === loop0 ? t0 : dir ? 0 : d;
      let end = loop === loop1 ? t1 : dir ? d : 0;
      if (rev) {
        start = d - start;
        end = d - end;
      }
      if (bounce && loop !== loop0 && start === end) {} else if (this._runActionsRange(start, end, jump, includeStart || loop !== loop0 && !bounce)) {
        return true;
      }
      includeStart = false;
    } while (dir && ++loop <= loop1 || !dir && --loop >= loop1);
  }
  _runActionsRange(startPos, endPos, jump, includeStart) {
    throw "_runActionsRange is abstract and must be overridden by a subclass.";
  }
  _updatePosition(jump, end) {
    throw "_updatePosition is abstract and must be overridden by a subclass.";
  }
}

function linear(t) {
  return t;
}

function get(amount) {
  if (amount < -1) {
    amount = -1;
  } else if (amount > 1) {
    amount = 1;
  }
  return function(t) {
    if (amount == 0) {
      return t;
    }
    if (amount < 0) {
      return t * (t * -amount + 1 + amount);
    }
    return t * ((2 - t) * amount + (1 - amount));
  };
}

function getPowIn(pow) {
  return function(t) {
    return Math.pow(t, pow);
  };
}

function getPowOut(pow) {
  return function(t) {
    return 1 - Math.pow(1 - t, pow);
  };
}

function getPowInOut(pow) {
  return function(t) {
    if ((t *= 2) < 1) return .5 * Math.pow(t, pow);
    return 1 - .5 * Math.abs(Math.pow(2 - t, pow));
  };
}

function sineIn(t) {
  return 1 - Math.cos(t * Math.PI / 2);
}

function sineOut(t) {
  return Math.sin(t * Math.PI / 2);
}

function sineInOut(t) {
  return -.5 * (Math.cos(Math.PI * t) - 1);
}

function getBackIn(amount) {
  return function(t) {
    return t * t * ((amount + 1) * t - amount);
  };
}

function getBackOut(amount) {
  return function(t) {
    return --t * t * ((amount + 1) * t + amount) + 1;
  };
}

function getBackInOut(amount) {
  amount *= 1.525;
  return function(t) {
    if ((t *= 2) < 1) return .5 * (t * t * ((amount + 1) * t - amount));
    return .5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
  };
}

function circIn(t) {
  return -(Math.sqrt(1 - t * t) - 1);
}

function circOut(t) {
  return Math.sqrt(1 - --t * t);
}

function circInOut(t) {
  if ((t *= 2) < 1) return -.5 * (Math.sqrt(1 - t * t) - 1);
  return .5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
}

function bounceIn(t) {
  return 1 - Ease.bounceOut(1 - t);
}

function bounceOut(t) {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + .75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + .9375;
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }
}

function bounceInOut(t) {
  if (t < .5) return Ease.bounceIn(t * 2) * .5;
  return Ease.bounceOut(t * 2 - 1) * .5 + .5;
}

function getElasticIn(amplitude, period) {
  let pi2 = Math.PI * 2;
  return function(t) {
    if (t === 0 || t === 1) return t;
    let s = period / pi2 * Math.asin(1 / amplitude);
    return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
  };
}

function getElasticOut(amplitude, period) {
  let pi2 = Math.PI * 2;
  return function(t) {
    if (t === 0 || t === 1) return t;
    let s = period / pi2 * Math.asin(1 / amplitude);
    return amplitude * Math.pow(2, -10 * t) * Math.sin((t - s) * pi2 / period) + 1;
  };
}

function getElasticInOut(amplitude, period) {
  let pi2 = Math.PI * 2;
  return function(t) {
    let s = period / pi2 * Math.asin(1 / amplitude);
    if ((t *= 2) < 1) return -.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * pi2 / period));
    return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * pi2 / period) * .5 + 1;
  };
}

const none = linear;

const quadIn = getPowIn(2);

const quadOut = getPowOut(2);

const quadInOut = getPowInOut(2);

const cubicIn = getPowIn(3);

const cubicOut = getPowOut(3);

const cubicInOut = getPowInOut(3);

const quartIn = getPowIn(4);

const quartOut = getPowOut(4);

const quartInOut = getPowInOut(4);

const quintIn = getPowIn(5);

const quintOut = getPowOut(5);

const quintInOut = getPowInOut(5);

const backIn = getBackIn(1.7);

const backOut = getBackOut(1.7);

const backInOut = getBackInOut(1.7);

const elasticIn = getElasticIn(1, .3);

const elasticOut = getElasticOut(1, .3);

const elasticInOut = getElasticInOut(1, .3 * 1.5);

var Ease = Object.freeze({
  linear: linear,
  get: get,
  getPowIn: getPowIn,
  getPowOut: getPowOut,
  getPowInOut: getPowInOut,
  sineIn: sineIn,
  sineOut: sineOut,
  sineInOut: sineInOut,
  getBackIn: getBackIn,
  getBackOut: getBackOut,
  getBackInOut: getBackInOut,
  circIn: circIn,
  circOut: circOut,
  circInOut: circInOut,
  bounceIn: bounceIn,
  bounceOut: bounceOut,
  bounceInOut: bounceInOut,
  getElasticIn: getElasticIn,
  getElasticOut: getElasticOut,
  getElasticInOut: getElasticInOut,
  none: none,
  quadIn: quadIn,
  quadOut: quadOut,
  quadInOut: quadInOut,
  cubicIn: cubicIn,
  cubicOut: cubicOut,
  cubicInOut: cubicInOut,
  quartIn: quartIn,
  quartOut: quartOut,
  quartInOut: quartInOut,
  quintIn: quintIn,
  quintOut: quintOut,
  quintInOut: quintInOut,
  backIn: backIn,
  backOut: backOut,
  backInOut: backInOut,
  elasticIn: elasticIn,
  elasticOut: elasticOut,
  elasticInOut: elasticInOut
});

class Ticker extends EventDispatcher {
  static get RAF_SYNCHED() {
    return "synched";
  }
  static get RAF() {
    return "raf";
  }
  static get TIMEOUT() {
    return "timeout";
  }
  constructor(name) {
    super();
    this.name = name;
    this.timingMode = Ticker.TIMEOUT;
    this.maxDelta = 0;
    this.paused = false;
    this._inited = false;
    this._startTime = 0;
    this._pausedTime = 0;
    this._ticks = 0;
    this._pausedTicks = 0;
    this._interval = 50;
    this._lastTime = 0;
    this._times = null;
    this._tickTimes = null;
    this._timerId = null;
    this._raf = true;
  }
  get interval() {
    return this._interval;
  }
  set interval(interval) {
    this._interval = interval;
    if (!this._inited) {
      return;
    }
    this._setupTick();
  }
  get framerate() {
    return 1e3 / this._interval;
  }
  set framerate(framerate) {
    this.interval = 1e3 / framerate;
  }
  init() {
    if (this._inited) {
      return;
    }
    this._inited = true;
    this._times = [];
    this._tickTimes = [];
    this._startTime = this._getTime();
    this._times.push(this._lastTime = 0);
    this._setupTick();
  }
  reset() {
    if (this._raf) {
      let f = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame;
      f && f(this._timerId);
    } else {
      clearTimeout(this._timerId);
    }
    this.removeAllEventListeners("tick");
    this._timerId = this._times = this._tickTimes = null;
    this._startTime = this._lastTime = this._ticks = 0;
    this._inited = false;
  }
  addEventListener(type, listener, useCapture) {
    !this._inited && this.init();
    return super.addEventListener(type, listener, useCapture);
  }
  getMeasuredTickTime(ticks = null) {
    const times = this._tickTimes;
    if (!times || times.length < 1) {
      return -1;
    }
    ticks = Math.min(times.length, ticks || this.framerate | 0);
    return times.reduce((a, b) => a + b, 0) / ticks;
  }
  getMeasuredFPS(ticks = null) {
    const times = this._times;
    if (!times || times.length < 2) {
      return -1;
    }
    ticks = Math.min(times.length - 1, ticks || this.framerate | 0);
    return 1e3 / ((times[0] - times[ticks]) / ticks);
  }
  getTime(runTime = false) {
    return this._startTime ? this._getTime() - (runTime ? this._pausedTime : 0) : -1;
  }
  getEventTime(runTime = false) {
    return this._startTime ? (this._lastTime || this._startTime) - (runTime ? this._pausedTime : 0) : -1;
  }
  getTicks(pauseable = false) {
    return this._ticks - (pauseable ? this._pausedTicks : 0);
  }
  _handleSynch() {
    this._timerId = null;
    this._setupTick();
    if (this._getTime() - this._lastTime >= (this._interval - 1) * .97) {
      this._tick();
    }
  }
  _handleRAF() {
    this._timerId = null;
    this._setupTick();
    this._tick();
  }
  _handleTimeout() {
    this._timerId = null;
    this._setupTick();
    this._tick();
  }
  _setupTick() {
    if (this._timerId != null) {
      return;
    }
    const mode = this.timingMode || this._raf && Ticker.RAF;
    if (mode === Ticker.RAF_SYNCHED || mode === Ticker.RAF) {
      const f = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
      if (f) {
        this._timerId = f(mode === Ticker.RAF ? this._handleRAF.bind(this) : this._handleSynch.bind(this));
        this._raf = true;
        return;
      }
    }
    this._raf = false;
    this._timerId = setTimeout(this._handleTimeout.bind(this), this._interval);
  }
  _tick() {
    const paused = this.paused, time = this._getTime(), elapsedTime = time - this._lastTime;
    this._lastTime = time;
    this._ticks++;
    if (paused) {
      this._pausedTicks++;
      this._pausedTime += elapsedTime;
    }
    if (this.hasEventListener("tick")) {
      const event = new Event("tick");
      const maxDelta = this.maxDelta;
      event.delta = maxDelta && elapsedTime > maxDelta ? maxDelta : elapsedTime;
      event.paused = paused;
      event.time = time;
      event.runTime = time - this._pausedTime;
      this.dispatchEvent(event);
    }
    this._tickTimes.unshift(this._getTime() - time);
    while (this._tickTimes.length > 100) {
      this._tickTimes.pop();
    }
    this._times.unshift(time);
    while (this._times.length > 100) {
      this._times.pop();
    }
  }
  _getTime() {
    const now = window.performance && window.performance.now;
    return (now && now.call(performance) || new Date().getTime()) - this._startTime;
  }
  static on(type, listener, scope, once, data, useCapture) {
    return _instance.on(type, listener, scope, once, data, useCapture);
  }
  static removeEventListener(type, listener, useCapture) {
    _instance.removeEventListener(type, listener, useCapture);
  }
  static off(type, listener, useCapture) {
    _instance.off(type, listener, useCapture);
  }
  static removeAllEventListeners(type) {
    _instance.removeAllEventListeners(type);
  }
  static dispatchEvent(eventObj, bubbles, cancelable) {
    return _instance.dispatchEvent(eventObj, bubbles, cancelable);
  }
  static hasEventListener(type) {
    return _instance.hasEventListener(type);
  }
  static willTrigger(type) {
    return _instance.willTrigger(type);
  }
  static toString() {
    return _instance.toString();
  }
  static init() {
    _instance.init();
  }
  static reset() {
    _instance.reset();
  }
  static addEventListener(type, listener, useCapture) {
    _instance.addEventListener(type, listener, useCapture);
  }
  static getMeasuredTickTime(ticks) {
    return _instance.getMeasuredTickTime(ticks);
  }
  static getMeasuredFPS(ticks) {
    return _instance.getMeasuredFPS(ticks);
  }
  static getTime(runTime) {
    return _instance.getTime(runTime);
  }
  static getEventTime(runTime) {
    return _instance.getEventTime(runTime);
  }
  static getTicks(pauseable) {
    return _instance.getTicks(pauseable);
  }
  static get interval() {
    return _instance.interval;
  }
  static set interval(interval) {
    _instance.interval = interval;
  }
  static get framerate() {
    return _instance.framerate;
  }
  static set framerate(framerate) {
    _instance.framerate = framerate;
  }
  static get name() {
    return _instance.name;
  }
  static set name(name) {
    _instance.name = name;
  }
  static get timingMode() {
    return _instance.timingMode;
  }
  static set timingMode(timingMode) {
    _instance.timingMode = timingMode;
  }
  static get maxDelta() {
    return _instance.maxDelta;
  }
  static set maxDelta(maxDelta) {
    _instance.maxDelta = maxDelta;
  }
  static get paused() {
    return _instance.paused;
  }
  static set paused(paused) {
    _instance.paused = paused;
  }
}

const _instance = new Ticker("createjs.global");

class Tween extends AbstractTween {
  constructor(target, props) {
    super(props);
    this.pluginData = null;
    this.target = target;
    this.passive = false;
    this._stepHead = new TweenStep(null, 0, 0, {}, null, true);
    this._stepTail = this._stepHead;
    this._stepPosition = 0;
    this._actionHead = null;
    this._actionTail = null;
    this._plugins = null;
    this._pluginIds = null;
    this._injected = null;
    if (props) {
      this.pluginData = props.pluginData;
      if (props.override) {
        Tween.removeTweens(target);
      }
    }
    if (!this.pluginData) {
      this.pluginData = {};
    }
    this._init(props);
  }
  static get(target, props) {
    return new Tween(target, props);
  }
  static tick(delta, paused) {
    let tween = Tween._tweenHead;
    while (tween) {
      let next = tween._next;
      if (paused && !tween.ignoreGlobalPause || tween._paused) {} else {
        tween.advance(tween.useTicks ? 1 : delta);
      }
      tween = next;
    }
  }
  static handleEvent(event) {
    if (event.type === "tick") {
      this.tick(event.delta, event.paused);
    }
  }
  static removeTweens(target) {
    if (!target.tweenjs_count) {
      return;
    }
    let tween = Tween._tweenHead;
    while (tween) {
      let next = tween._next;
      if (tween.target === target) {
        tween.paused = true;
      }
      tween = next;
    }
    target.tweenjs_count = 0;
  }
  static removeAllTweens() {
    let tween = Tween._tweenHead;
    while (tween) {
      let next = tween._next;
      tween._paused = true;
      tween.target && (tween.target.tweenjs_count = 0);
      tween._next = tween._prev = null;
      tween = next;
    }
    Tween._tweenHead = Tween._tweenTail = null;
  }
  static hasActiveTweens(target) {
    if (target) {
      return !!target.tweenjs_count;
    }
    return !!Tween._tweenHead;
  }
  static installPlugin(plugin, props) {
    plugin.install(props);
    const priority = plugin.priority = plugin.priority || 0, arr = Tween._plugins = Tween._plugins || [];
    for (let i = 0, l = arr.length; i < l; i++) {
      if (priority < arr[i].priority) {
        break;
      }
    }
    arr.splice(i, 0, plugin);
  }
  static _register(tween, paused) {
    const target = tween.target;
    if (!paused && tween._paused) {
      if (target) {
        target.tweenjs_count = target.tweenjs_count ? target.tweenjs_count + 1 : 1;
      }
      let tail = Tween._tweenTail;
      if (!tail) {
        Tween._tweenHead = Tween._tweenTail = tween;
      } else {
        Tween._tweenTail = tail._next = tween;
        tween._prev = tail;
      }
      if (!Tween._inited) {
        Ticker.addEventListener("tick", Tween);
        Tween._inited = true;
      }
    } else if (paused && !tween._paused) {
      if (target) {
        target.tweenjs_count--;
      }
      let next = tween._next, prev = tween._prev;
      if (next) {
        next._prev = prev;
      } else {
        Tween._tweenTail = prev;
      }
      if (prev) {
        prev._next = next;
      } else {
        Tween._tweenHead = next;
      }
      tween._next = tween._prev = null;
    }
  }
  wait(duration, passive = false) {
    if (duration > 0) {
      this._addStep(+duration, this._stepTail.props, null, passive);
    }
    return this;
  }
  to(props, duration = 0, ease = linear) {
    if (duration < 0) {
      duration = 0;
    }
    const step = this._addStep(+duration, null, ease);
    this._appendProps(props, step);
    return this;
  }
  label(name) {
    this.addLabel(name, this.duration);
    return this;
  }
  call(callback, params, scope) {
    return this._addAction(scope || this.target, callback, params || [ this ]);
  }
  set(props, target) {
    return this._addAction(target || this.target, this._set, [ props ]);
  }
  play(tween) {
    return this._addAction(tween || this, this._set, [ {
      paused: false
    } ]);
  }
  pause(tween) {
    return this._addAction(tween || this, this._set, [ {
      paused: false
    } ]);
  }
  clone() {
    throw "Tween can not be cloned.";
  }
  _addPlugin(plugin) {
    let ids = this._pluginIds || (this._pluginIds = {}), id = plugin.id;
    if (!id || ids[id]) {
      return;
    }
    ids[id] = true;
    let plugins = this._plugins || (this._plugins = []), priority = plugin.priority || 0;
    for (let i = 0, l = plugins.length; i < l; i++) {
      if (priority < plugins[i].priority) {
        plugins.splice(i, 0, plugin);
        return;
      }
    }
    plugins.push(plugin);
  }
  _updatePosition(jump, end) {
    let step = this._stepHead.next, t = this.position, d = this.duration;
    if (this.target && step) {
      let stepNext = step.next;
      while (stepNext && stepNext.t <= t) {
        step = step.next;
        stepNext = step.next;
      }
      let ratio = end ? d === 0 ? 1 : t / d : (t - step.t) / step.d;
      this._updateTargetProps(step, ratio, end);
    }
    this._stepPosition = step ? t - step.t : 0;
  }
  _updateTargetProps(step, ratio, end) {
    if (this.passive = !!step.passive) {
      return;
    }
    let v, v0, v1, ease;
    let p0 = step.prev.props;
    let p1 = step.props;
    if (ease = step.ease) {
      ratio = ease(ratio, 0, 1, 1);
    }
    let plugins = this._plugins;
    proploop: for (let n in p0) {
      v0 = p0[n];
      v1 = p1[n];
      if (v0 !== v1 && typeof v0 === "number") {
        v = v0 + (v1 - v0) * ratio;
      } else {
        v = ratio >= 1 ? v1 : v0;
      }
      if (plugins) {
        for (let i = 0, l = plugins.length; i < l; i++) {
          let value = plugins[i].change(this, step, n, v, ratio, end);
          if (value === Tween.IGNORE) {
            continue proploop;
          }
          if (value !== undefined) {
            v = value;
          }
        }
      }
      this.target[n] = v;
    }
  }
  _runActionsRange(startPos, endPos, jump, includeStart) {
    let rev = startPos > endPos;
    let action = rev ? this._actionTail : this._actionHead;
    let ePos = endPos, sPos = startPos;
    if (rev) {
      ePos = startPos;
      sPos = endPos;
    }
    let t = this.position;
    while (action) {
      let pos = action.t;
      if (pos === endPos || pos > sPos && pos < ePos || includeStart && pos === startPos) {
        action.funct.apply(action.scope, action.params);
        if (t !== this.position) {
          return true;
        }
      }
      action = rev ? action.prev : action.next;
    }
  }
  _appendProps(props, step, stepPlugins) {
    let initProps = this._stepHead.props, target = this.target, plugins = Tween._plugins;
    let n, i, l, value, initValue, inject;
    let oldStep = step.prev, oldProps = oldStep.props;
    let stepProps = step.props || (step.props = this._cloneProps(oldProps));
    let cleanProps = {};
    for (n in props) {
      if (!props.hasOwnProperty(n)) {
        continue;
      }
      cleanProps[n] = stepProps[n] = props[n];
      if (initProps[n] !== undefined) {
        continue;
      }
      initValue = undefined;
      if (plugins) {
        for (i = plugins.length - 1; i >= 0; i--) {
          value = plugins[i].init(this, n, initValue);
          if (value !== undefined) {
            initValue = value;
          }
          if (initValue === Tween.IGNORE) {
            (ignored = ignored || {})[n] = true;
            delete stepProps[n];
            delete cleanProps[n];
            break;
          }
        }
      }
      if (initValue !== Tween.IGNORE) {
        if (initValue === undefined) {
          initValue = target[n];
        }
        oldProps[n] = initValue === undefined ? null : initValue;
      }
    }
    for (n in cleanProps) {
      value = props[n];
      let o, prev = oldStep;
      while ((o = prev) && (prev = o.prev)) {
        if (prev.props === o.props) {
          continue;
        }
        if (prev.props[n] !== undefined) {
          break;
        }
        prev.props[n] = oldProps[n];
      }
    }
    if (stepPlugins && (plugins = this._plugins)) {
      for (i = plugins.length - 1; i >= 0; i--) {
        plugins[i].step(this, step, cleanProps);
      }
    }
    if (inject = this._injected) {
      this._injected = null;
      this._appendProps(inject, step, false);
    }
  }
  _injectProp(name, value) {
    let o = this._injected || (this._injected = {});
    o[name] = value;
  }
  _addStep(duration, props, ease, passive = false) {
    let step = new TweenStep(this._stepTail, this.duration, duration, props, ease, passive);
    this.duration += duration;
    return this._stepTail = this._stepTail.next = step;
  }
  _addAction(scope, funct, params) {
    let action = new TweenAction(this._actionTail, this.duration, scope, funct, params);
    if (this._actionTail) {
      this._actionTail.next = action;
    } else {
      this._actionHead = action;
    }
    this._actionTail = action;
    return this;
  }
  _set(props) {
    for (let n in props) {
      this[n] = props[n];
    }
  }
  _cloneProps(props) {
    let o = {};
    for (let n in props) {
      o[n] = props[n];
    }
    return o;
  }
}

{
  let p = Tween.prototype;
  p.w = p.wait;
  p.t = p.to;
  p.c = p.call;
  p.s = p.set;
}

Tween.IGNORE = {};

Tween._tweens = [];

Tween._plugins = null;

Tween._tweenHead = null;

Tween._tweenTail = null;

class TweenStep {
  constructor(prev, t, d, props, ease, passive) {
    this.next = null;
    this.prev = prev;
    this.t = t;
    this.d = d;
    this.props = props;
    this.ease = ease;
    this.passive = passive;
    this.index = prev ? prev.index + 1 : 0;
  }
}

class TweenAction {
  constructor(prev, t, scope, funct, params) {
    this.next = null;
    this.d = 0;
    this.prev = prev;
    this.t = t;
    this.scope = scope;
    this.funct = funct;
    this.params = params;
  }
}

class Timeline extends AbstractTween {
  constructor(props = {}) {
    super(props);
    this.tweens = [];
    if (props.tweens) {
      this.addTween(...props.tweens);
    }
    if (props.labels) {
      this.labels = props.labels;
    }
    this._init(props);
  }
  addTween(...tweens) {
    const l = tweens.length;
    if (l === 1) {
      const tween = tweens[0];
      this.tweens.push(tween);
      tween._parent = this;
      tween.paused = true;
      let d = tween.duration;
      if (tween.loop > 0) {
        d *= tween.loop + 1;
      }
      if (d > this.duration) {
        this.duration = d;
      }
      if (this.rawPosition >= 0) {
        tween.setPosition(this.rawPosition);
      }
      return tween;
    }
    if (l > 1) {
      for (let i = 0; i < l; i++) {
        this.addTween(tweens[i]);
      }
      return tweens[l - 1];
    }
    return null;
  }
  removeTween(...tweens) {
    const l = tweens.length;
    if (l === 1) {
      const tw = this.tweens;
      const tween = tweens[0];
      let i = tw.length;
      while (i--) {
        if (tw[i] === tween) {
          tw.splice(i, 1);
          tween._parent = null;
          if (tween.duration >= this.duration) {
            this.updateDuration();
          }
          return true;
        }
      }
      return false;
    }
    if (l > 1) {
      let good = true;
      for (let i = 0; i < l; i++) {
        good = good && this.removeTween(tweens[i]);
      }
      return good;
    }
    return true;
  }
  updateDuration() {
    this.duration = 0;
    for (let i = 0, l = this.tweens.length; i < l; i++) {
      let tween = this.tweens[i];
      let d = tween.duration;
      if (tween.loop > 0) {
        d *= tween.loop + 1;
      }
      if (d > this.duration) {
        this.duration = d;
      }
    }
  }
  clone() {
    throw "Timeline can not be cloned.";
  }
  _updatePosition(jump, end) {
    const t = this.position;
    for (let i = 0, l = this.tweens.length; i < l; i++) {
      this.tweens[i].setPosition(t, true, jump);
    }
  }
  _runActionsRange(startPos, endPos, jump, includeStart) {
    const t = this.position;
    for (let i = 0, l = this.tweens.length; i < l; i++) {
      this.tweens[i]._runActions(startPos, endPos, jump, includeStart);
      if (t !== this.position) {
        return true;
      }
    }
  }
}

export { Ease as Ease, Tween, AbstractTween, Timeline };

export { Event, EventDispatcher, Ticker };

var cjs = window.createjs = window.createjs || {};

var v = cjs.v = cjs.v || {};

v.tweenjs = "2.0.0";
//# sourceMappingURL=maps/tweenjs.module.js.map
