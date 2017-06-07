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
	 * 				behaviour. This may override your end rotation value.</LI>
	 * 		</UL></LI>
	 * </UL>
	 * Guide objects should not be shared between tweens even if all properties are identical, the library stores
	 * information on these objects in the background and sharing them can cause unexpected behaviour. Values
	 * outside 0-1 range of tweens will be a "best guess" from the appropriate part of the defined curve.
	 *
	 * @class MotionGuidePlugin
	 * @constructor
	 */
	function MotionGuidePlugin() {
		throw("MotionGuidePlugin cannot be instantiated.")
	}
	var s = MotionGuidePlugin;


// static properties:
	/**
	 * @property priority
	 * @protected
	 * @static
	 */
	s.priority = 0; // high priority, should run sooner

	/**
	 * READ-ONLY. A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
	 * @property ID
	 * @type {String}
	 * @static
	 * @readonly
	 */
	s.ID = "MotionGuide";

// static methods
	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 */
	s.install = function() {
		createjs.Tween._installPlugin(MotionGuidePlugin);
		return createjs.Tween.IGNORE;
	};

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
	s.init = function(tween, prop, value) {
		if(prop == "guide") {
			tween._addPlugin(s);
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
	s.step = function(tween, step, props) {
		for (var n in props) {
			if(n !== "guide") { continue; }

			var guideData = step.props.guide;
			var error = s._solveGuideData(props.guide, guideData);
			guideData.valid = !error;

			var end = guideData.endData;
			tween._injectProp("x", end.x);
			tween._injectProp("y", end.y);

			if(error || !guideData.orient) { break; }

			var initRot = step.prev.props.rotation === undefined ? (tween.target.rotation || 0) : step.prev.props.rotation;

			guideData.startOffsetRot = initRot - guideData.startData.rotation;

			if(guideData.orient == "fixed") {
				// controlled rotation
				guideData.endAbsRot = end.rotation + guideData.startOffsetRot;
				guideData.deltaRotation = 0;
			} else {
				// interpreted rotation

				var finalRot = props.rotation === undefined ? (tween.target.rotation || 0) : props.rotation;
				var deltaRot = (finalRot - guideData.endData.rotation) - guideData.startOffsetRot;
				var modRot = deltaRot % 360;

				guideData.endAbsRot = finalRot;

				switch(guideData.orient) {
					case "auto":
						guideData.deltaRotation = deltaRot;
						break;
					case "cw":
						guideData.deltaRotation = ((modRot + 360) % 360) + (360 * Math.abs((deltaRot/360) |0));
						break;
					case "ccw":
						guideData.deltaRotation = ((modRot - 360) % 360) + (-360 * Math.abs((deltaRot/360) |0));
						break;
				}
			}

			tween._injectProp("rotation", guideData.endAbsRot);
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
	s.change = function(tween, step, prop, value, ratio, end) {
		var guideData = step.props.guide;

		if(
				!guideData ||							// Missing data
				(step.props === step.prev.props) || 	// In a wait()
				(guideData === step.prev.props.guide) 	// Guide hasn't changed
		) {
			return; // have no business making decisions
		}
		if(
				(prop === "guide" && !guideData.valid) ||		// this data is broken
				(prop == "x" || prop == "y") ||					// these always get over-written
				(prop === "rotation" && guideData.orient)		// currently over-written
		){
			return createjs.Tween.IGNORE;
		}

		s._ratioToPositionData(ratio, guideData, tween.target);
	};

// public methods
	/**
	 * Provide potentially useful debugging information, like running the error detection system, and rendering the path
	 * defined in the guide data.
	 *
	 * NOTE: you will need to transform your context 2D to the local space of the guide if you wish to line it up.
	 * @param {Object} guideData All the information describing the guide to be followed.
	 * @param {DrawingContext2D} [ctx=undefined] The context to draw the object into.
	 * @param {Array} [higlight=undefined] Array of ratio positions to highlight
	 * @returns {undefined|String}
	 */
	s.debug = function(guideData, ctx, higlight) {
		guideData = guideData.guide || guideData;

		// errors
		var err = s._findPathProblems(guideData);
		if(err) {
			console.error("MotionGuidePlugin Error found: \n" + err);
		}

		// drawing
		if(!ctx){ return err; }

		var i;
		var path = guideData.path;
		var pathLength = path.length;
		var width = 3;
		var length = 9;

		ctx.save();
		//ctx.resetTransform();

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
		ctx.lineWidth = width*1.5;
		ctx.stroke();
		ctx.strokeStyle = "white";
		ctx.lineWidth = width;
		ctx.stroke();
		ctx.closePath();

		// highlights
		var hiCount = higlight.length;
		if(higlight && hiCount) {
			var tempStore = {};
			var tempLook = {};
			s._solveGuideData(guideData, tempStore);

			for(var i=0; i<hiCount; i++){
				tempStore.orient = "fixed";
				s._ratioToPositionData(higlight[i], tempStore, tempLook);

				ctx.beginPath();

				ctx.moveTo(tempLook.x, tempLook.y);
				ctx.lineTo(
					tempLook.x + Math.cos(tempLook.rotation * 0.0174533) * length,
					tempLook.y + Math.sin(tempLook.rotation * 0.0174533) * length
				);

				ctx.strokeStyle = "black";
				ctx.lineWidth = width*1.5;
				ctx.stroke();
				ctx.strokeStyle = "red";
				ctx.lineWidth = width;
				ctx.stroke();
				ctx.closePath();
			}
		}

		// end draw
		ctx.restore();

		return err;
	};

// private methods
	/**
	 * Calculate and store optimization data about the desired path to improve performance and accuracy of positions.
	 * @param {Object} source The guide data provided to the tween call
	 * @param {Object} storage the guide data used by the step calls and plugin to do the job, will be overwritten
	 * @returns {undefined|String} Can return an error if unable to generate the data.
	 * @private
	 */
	s._solveGuideData = function(source, storage) {
		var err = undefined;
		if(err = s.debug(source)) { return err; }

		var path = storage.path = source.path;
		var orient = storage.orient = source.orient;
		storage.subLines = [];
		storage.totalLength = 0;
		storage.startOffsetRot = 0;
		storage.deltaRotation = 0;
		storage.startData = {ratio: 0};
		storage.endData = {ratio: 1};
		storage.animSpan = 1;

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
		var startRatio = isNaN(source.start) ? 0 : source.start;
		var endRatio = isNaN(source.end) ? 1 : source.end;
		s._ratioToPositionData(startRatio, storage, storage.startData);
		s._ratioToPositionData(endRatio, storage, storage.endData);

		// this has to be done last else the prev ratios will be out of place
		storage.startData.ratio = startRatio;
		storage.endData.ratio = endRatio;
		storage.animSpan = storage.endData.ratio - storage.startData.ratio;
	};

	/**
	 * Convert a percentage along the line into, a local line (start, control, end) t-value for calculation.
	 * @param {Number} ratio The (euclidean distance) percentage into the whole curve.
	 * @param {Object} guideData All the information describing the guide to be followed.
	 * @param {Object} output Object to save output properties of x,y, and rotation onto.
	 * @returns {Object} The output object, useful for isolated calls.
	 * @private
	 */
	s._ratioToPositionData = function(ratio, guideData, output) {
		var lineSegments = guideData.subLines;

		var i,l, t, test, target;

		var look = 0;
		var precision = 10;
		var effRatio = (ratio * guideData.animSpan) + guideData.startData.ratio;

		// find subline
		l = lineSegments.length;
		for(i=0; i<l; i++) {
			test = lineSegments[i].portion;
			if(look + test >= effRatio){ target = i; break; }
			look += test;
		}
		if(target === undefined) { target = l-1;  look -= test; }

		// find midline weighting
		var subLines = lineSegments[target].weightings;
		var portion = test;
		l = subLines.length;
		for(i=0; i<l; i++) {
			test = subLines[i] * portion;
			if(look + test >= effRatio){ break; }
			look += test;
		}

		// translate the subline index into a position in the path data
		target = (target*4) + 2;
		// take the distance we've covered in our ratio, and scale it to distance into the weightings
		t = (i/precision) + (((effRatio-look) / test) * (1/precision));

		// position
		var pathData = guideData.path;
		s._getParamsForCurve(
			pathData[target-2],			pathData[target-1],
			pathData[target],			pathData[target+1],
			pathData[target+2],			pathData[target+3],
			t,
			guideData.orient,
			output
		);

		if(guideData.orient) {
			if(ratio >= 0.99999 && ratio <= 1.00001 && guideData.endAbsRot !== undefined) {
				output.rotation = guideData.endAbsRot;
			} else {
				output.rotation += guideData.startOffsetRot + (ratio * guideData.deltaRotation);
			}
		}

		return output;
	};

	/**
	 * For a given quadratic bezier t-value, what is the position and rotation. Save it onto the output object.
	 * @param {Number} sx Start x.
	 * @param {Number} sy Start y.
	 * @param {Number} cx Control x.
	 * @param {Number} cy Control y.
	 * @param {Number} ex End x.
	 * @param {Number} ey End y.
	 * @param {Number} t T value (parametric distance into curve).
	 * @param {Boolean} orient Save rotation data.
	 * @param {Object} output Object to save output properties of x,y, and rotation onto.
	 * @private
	 */
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

	/**
	 * Perform a check to validate path information so plugin can avoid later error checking.
	 * @param {Object} guideData All the information describing the guide to be followed.
	 * @returns {undefined|String} The problem found, or undefined if no problems.
	 * @private
	 */
	s._findPathProblems = function(guideData) {
		var path = guideData.path;
		var valueCount = (path && path.length) || 0;	// ensure this is a number to simplify later logic
		if(valueCount < 6 || (valueCount-2) % 4) {
			var message =	"\tCannot parse 'path' array due to invalid number of entries in path. ";
			message +=		"There should be an odd number of points, at least 3 points, and 2 entries per point (x & y). ";
			message +=		"See 'CanvasRenderingContext2D.quadraticCurveTo' for details as 'path' models a quadratic bezier.\n\n";
			message +=		"Only [ "+ valueCount +" ] values found. Expected: "+ Math.max(Math.ceil((valueCount-2)/4)*4+2, 6); //6, 10, 14,...
			return message;
		}

		for(var i=0; i<valueCount; i++) {
			if(isNaN(path[i])){
				return "All data in path array must be numeric";
			}
		}

		var start = guideData.start;
		if(isNaN(start) && !(start === undefined)/* || start < 0 || start > 1*/) {	// outside 0-1 is unpredictable, but not breaking
			return "'start' out of bounds. Expected 0 to 1, got: "+ start;
		}
		var end = guideData.end;
		if(isNaN(end) && (end !== undefined)/* || end < 0 || end > 1*/) {	// outside 0-1 is unpredictable, but not breaking
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
