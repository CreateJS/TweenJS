/*
 * MotionGuidePlugin
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
 * @module TweenJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
	"use strict";

	/**
	 * A TweenJS plugin for working with motion guides. Defined paths which objects can follow or orient along.
	 *
	 * To use the plugin, install the plugin after TweenJS has loaded. To define a path, add
	 *
	 * 		createjs.MotionGuidePlugin.install();
	 *
	 * <h4>Example</h4>
	 *
	 * 		// Using a Motion Guide
	 * 		createjs.Tween.get(target).to({guide:{ path:[0,0, 0,200,200,200, 200,0,0,0] }},7000);
	 * 		// Visualizing the line
	 * 		graphics.moveTo(0,0).curveTo(0,200,200,200).curveTo(200,0,0,0);
	 *
	 * Each path needs pre-computation to ensure there's fast performance. Because of the pre-computation there's no
	 * built in support for path changes mid tween. These are the Guide Object's properties:<UL>
	 * 		<LI> path: Required, Array : The x/y points used to draw the path with a moveTo and 1 to n curveTo calls.</LI>
	 * 		<LI> start: Optional, 0-1 : Initial position, default 0 except for when continuing along the same path.</LI>
	 * 		<LI> end: Optional, 0-1 : Final position, default 1 if not specified.</LI>
	 * 		<LI> orient: Optional, string : "fixed"/"auto"/"cw"/"ccw"<UL>
	 *				<LI>"fixed" forces the object to face down the path all movement (relative to start rotation),</LI>
	 * 				<LI>"auto" rotates the object along the path relative to the line.</LI>
	 * 				<LI>"cw"/"ccw" force clockwise or counter clockwise rotations including Adobe Flash/Animate-like
	 * 				behaviour</LI>
	 * 		</UL></LI>
	 * </UL>
	 * Guide objects should not be shared between tweens even if all properties are identical, the library stores
	 * information on these objects in the background and sharing them can cause unexpected behaviour. Values
	 * outside 0-1 range of tweens will be a "best guess" from the appropriate part of the defined curve.
	 *
	 * @class MotionGuidePlugin
	 * @constructor
	 **/
	function MotionGuidePlugin() {
		throw("MotionGuidePlugin cannot be instantiated.")
	}
	var s = MotionGuidePlugin;


// static properties:
	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	s.priority = 0; // high priority, should run sooner

	/**
	 * READ-ONLY. A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
	 * @property ID
	 * @type {String}
	 * @static
	 * @readonly
	 **/
	s.ID = "MotionGuide";

// static methods
	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	s.install = function() {
		createjs.Tween._installPlugin(MotionGuidePlugin);
		return createjs.Tween.IGNORE;
	};

	s.init = function(tween, prop, value) {
		if(prop == "guide") {
			tween._addPlugin(s);
		}
	};

	s.step = function(tween, prop, props) {
		for (var n in props) {
			if(n != "guide") { continue; }
			tween.pluginData.motionGuide = {};
			s._solveGuideData(prop.props.guide, tween.pluginData.motionGuide);
		}
	};

	s.change = function(tween, step, prop, value, ratio, end) {
		if(prop != "guide"){ return; }

		var guideData = step.props.guide;
		var tweenData = tween.pluginData.motionGuide;
		var subLines = tweenData.subLines;

		var i,l, t, test, target;

		var subLine, look = 0;
		var precision = 10;

		// find subline
		l = subLines.length;
		for(i=0; i<l; i++) {
			test = subLines[i].portion;
			if(look + test >= ratio){ target = i; break; }
			look += test;
		}

		// find midline weighting
		subLines = subLines[target].weightings;
		l = subLines.length;
		for(i=0; i<l; i++) {
			test = subLines[i];
			if(look + test >= ratio){
				// take the distance we've covered in our ratio, and scale it to distance into the weightings
				//t = (i/precision) + (((ratio-look) / test) * (1/precision)); // logical but unoptimized
				t = (i*test + ratio-look) / (test * precision);
				break;
			}
			look += test;
		}

		// position
		target = (target*4) + 2;	// translate the subline index into a position in the path data
		var pathData = guideData.path;

		s._getParamsForCurve(
			pathData[target-2],			pathData[target-1],
			pathData[target],			pathData[target+1],
			pathData[target+2],			pathData[target+3],
			t,
			guideData.orient,
			tween.target
		);
	};

// public methods
	s.debug = function(guideData, ctx, higlight) {
		guideData = guideData.guide || guideData;

		// errors
		var err = s._findPathProblems(guideData);
		if(err) {
			console.error("MotionGuidePlugin Error found: \n" + err);
		}

		// drawing
		if(!ctx){ return; }

		var i;
		var path = guideData.path;
		var pathLength = path.length;

		ctx.save();
		ctx.resetTransform();

		ctx.lineCap = "round";
		ctx.lineJoin = "miter";
		ctx.beginPath();

		// curve
		ctx.moveTo(path[0], path[1]);
		for(i=2; i < pathLength; i+=4) {
			ctx.quadraticCurveTo(
				path[i], path[i+1],
				path[i+2], path[i+3]
			);
		}

		ctx.strokeStyle = "black";
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
		ctx.stroke();

		// highlights
		//TODO: draw highlight arrows showing&logging orientation&location of each point in array

		// end draw
		ctx.closePath();
		ctx.restore();
	};

// private methods
	s._solveGuideData = function(source, storage) {
		if(s._findPathProblems(source)) { return; }

		var path = storage.path = source.path;
		var orient = storage.orient = source.orient;
		storage.subLines = [];
		storage.totalLength = 0;

		var guideData = storage;
		var pathLength = path.length;

		var precision = 10;
		var sx,sy, cx,cy, ex,ey, i,j, len, temp = {};

		sx = path[0];		sy = path[1];

		// get the data for each curve
		for(i=2; i < pathLength; i+=4) {
			cx = path[i];			cy = path[i+1];
			ex = path[i+2];			ey = path[i+3];

			var subLine = {
				weightings: [],
				estLength: 0,
				portion: 0
			};

			var subX = sx, subY = sy;
			// get the distance data for each point
			for(j=1; j <= precision;j++) {	// we need to evaluate t = 1 not t = 0
				s._getParamsForCurve(sx,sy, cx,cy, ex,ey, j/precision, false, temp);

				var dx = temp.x - subX, dy = temp.y - subY;
				len = Math.sqrt(dx*dx + dy*dy);
				subLine.weightings.push(len);
				subLine.estLength += len;

				subX = temp.x;
				subY = temp.y;
			}

			// figure out full lengths
			storage.totalLength += subLine.estLength;

			// use length to figure out proportional weightings
			for(j=0; j < precision; j++) {
				len = subLine.estLength;
				subLine.weightings[j] = subLine.weightings[j] / len;
			}

			storage.subLines.push(subLine);
			sx = ex;
			sy = ey;
		}

		// use length to figure out proportional weightings
		len = storage.totalLength;
		var l = storage.subLines.length;
		for(i=0; i<l; i++) {
			storage.subLines[i].portion = storage.subLines[i].estLength / len;
		}

		// determine start and end data



	};

	s._getParamsForCurve = function(sx,sy, cx,cy, ex,ey, t, orient, output) {
		var inv = 1 - t;

		// finding a point on a bezier curve
		output.x =	inv*inv * sx + 2 * inv * t * cx + t*t * ex;
		output.y =	inv*inv * sy + 2 * inv * t * cy + t*t * ey;

		// finding an angle on a bezier curve
		if(orient) {
			// convert from radians back to degrees
			output.rotation = 57.2957795 * Math.atan2(
				(cy - sy)*inv + (ey - cy)*t,
				(cx - sx)*inv + (ex - cx)*t
			);
		}
	};

	s._findPathProblems = function(guideData) {
		var path = guideData.path;
		var pointCount = (path && path.length) || 0;	// ensure this is a number to simplify later logic
		if(pointCount < 6 || (pointCount-2) % 4) {
			var message =	"Cannot parse 'path' property due to invalid number of points in path.";
			message +=		"Requires x,y pairs for every point in the curve. The curve starts with a single point.";
			message +=		"Following that are control and end point pairs describing the line. See 'CanvasRenderingContext2D.quadraticCurveTo'";
			message +=		"Only [ "+ pointCount +" ] points found. Expected: "+ Math.max(Math.ceil((pointCount-2)/4)*4+2, 6); //6, 10, 14,...
			return message;
		}

		//TODO: check each value in array for undefined? This doesn't break things just causes NaN positions/rotations

		var start = guideData.start;
		if(isNaN(start) && !(start === undefined) || start < 0 || start > 1) {
			return "'start' out of bounds. Expected 0 to 1, got: "+ start;
		}
		var end = guideData.end;
		if(isNaN(end) && (end !== undefined) || end < 0 || end > 1) {
			return "'end' out of bounds. Expected 0 to 1, got: "+ end;
		}

		var orient = guideData.orient;
		if(orient) { // mirror the check used elsewhere
			if(orient != "fixed" && orient != "auto" && orient != "cw" && orient != "ccw") {
				return 'Invalid orientation value. Expected ["fixed", "auto", "cw", "ccw", undefined], got: '+ orient;
			}
		}

		return undefined;
	};

	createjs.MotionGuidePlugin = MotionGuidePlugin;

}());
