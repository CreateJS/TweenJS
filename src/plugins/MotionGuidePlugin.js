/**
 * @license MotionGuidePlugin
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
 * A TweenJS plugin for working with motion guides.
 *
 * To use, install the plugin after TweenJS has loaded. Next tween the 'guide' property with an object as detailed below.
 *
 *       createjs.MotionGuidePlugin.install();
 *
 * <h4>Example</h4>
 *
 *      // Using a Motion Guide
 *	    createjs.Tween.get(target).to({guide:{ path:[0,0, 0,200,200,200, 200,0,0,0] }},7000);
 *	    // Visualizing the line
 *	    graphics.moveTo(0,0).curveTo(0,200,200,200).curveTo(200,0,0,0);
 *
 * Each path needs pre-computation to ensure there's fast performance. Because of the pre-computation there's no
 * built in support for path changes mid tween. These are the Guide Object's properties:<UL>
 *      <LI> path: Required, Array : The x/y points used to draw the path with a moveTo and 1 to n curveTo calls.</LI>
 *      <LI> start: Optional, 0-1 : Initial position, default 0 except for when continuing along the same path.</LI>
 *      <LI> end: Optional, 0-1 : Final position, default 1 if not specified.</LI>
 *      <LI> orient: Optional, string : "fixed"/"auto"/"cw"/"ccw"<UL>
 *				<LI>"fixed" forces the object to face down the path all movement (relative to start rotation),</LI>
 *      		<LI>"auto" rotates the object along the path relative to the line.</LI>
 *      		<LI>"cw"/"ccw" force clockwise or counter clockwise rotations including flash like behaviour</LI>
 * 		</UL></LI>
 * </UL>
 * Guide objects should not be shared between tweens even if all properties are identical, the library stores
 * information on these objects in the background and sharing them can cause unexpected behaviour. Values
 * outside 0-1 range of tweens will be a "best guess" from the appropriate part of the defined curve.
 *
 * @memberof tweenjs
 * @static
 */
export default class MotionGuidePlugin {

	constructor () {
		throw "MotionGuidePlugin is static and cannot be instantiated.";
	}

// static methods
	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @static
	 */
	static install (props) {
		throw "MotionGuidePlugin has not been updated to work with the latest TweenJS plugin model yet. Soon!";
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
		if (prop === "guide") {
			tween._addPlugin(MotionGuidePlugin);
		}
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
	static step (tween, step, props) {
		for (let n in props) {
			if (n !== "guide") { continue; }

			let guideData = step.props.guide;
			let error = MotionGuidePlugin._solveGuideData(props.guide, guideData);
			guideData.valid = !error;

			let end = guideData.endData;
			tween._injectProp("x", end.x);
			tween._injectProp("y", end.y);

			if (error || !guideData.orient) { break; }

			let initRot = step.prev.props.rotation === undefined ? (tween.target.rotation || 0) : step.prev.props.rotation;
			guideData.startOffsetRot = initRot - guideData.startData.rotation;

			if (guideData.orient === "fixed") {
				// controlled rotation
				guideData.endAbsRot = end.rotation + guideData.startOffsetRot;
				guideData.deltaRotation = 0;
			} else {
				// interpreted rotation
				let finalRot = props.rotation === undefined ? (tween.target.rotation || 0) : props.rotation;
				let deltaRot = (finalRot - guideData.endData.rotation) - guideData.startOffsetRot;
				let modRot = deltaRot % 360;

				guideData.endAbsRot = finalRot;

				switch (guideData.orient) {
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
			let guideData = step.props.guide;
			if (
				!guideData ||													// missing data
				(step.props === step.prev.props) ||		// in a wait()
				(guideData === step.prev.props.guide)	// guide hasn't changed
			) {
				// have no business making decisions
				return;
			}
			if (
				(prop === "guide" && !guideData.valid) || // this data is broken
				(prop === "x" || prop === "y") ||         // these always get over-written
				(prop === "rotation" && guideData.orient) // currently over-written
			) {
				return createjs.Tween.IGNORE;
			}

			MotionGuidePlugin._ratioToPositionData(ratio, guideData, tween.target);
	}

	/**
	 * Provide potentially useful debugging information, like running the error detection system, and rendering the path
	 * defined in the guide data.
	 *
	 * NOTE: you will need to transform your context 2D to the local space of the guide if you wish to line it up.
	 * @param {Object} guideData All the information describing the guide to be followed.
	 * @param {DrawingContext2D} [ctx=undefined] The context to draw the object into.
	 * @param {Array} [higlight=undefined] Array of ratio positions to highlight
	 * @returns {String}
	 */
	static debug (guideData, ctx, higlight) {
		guideData = guideData.guide || guideData;

		// errors
		let err = MotionGuidePlugin._findPathProblems(guideData);
		if (err) {
			console.error(`MotionGuidePlugin Error found:\n${err}`);
		}

		// drawing
		if (!ctx) { return err; }

		let i;
		let path = guideData.path;
		let pathLength = path.length;
		let width = 3;
		let length = 9;

		ctx.save();
		//ctx.resetTransform();

		ctx.lineCap = "round";
		ctx.lineJoin = "miter";
		ctx.beginPath();

		// curve
		ctx.moveTo(path[0], path[1]);
		for (i = 2; i < pathLength; i += 4) {
			ctx.quadraticCurveTo(
				path[i], path[i + 1],
				path[i + 2], path[i + 3]
			);
		}
		ctx.strokeStyle = "black";
		ctx.lineWidth = width * 1.5;
		ctx.stroke();
		ctx.strokeStyle = "white";
		ctx.lineWidth = width;
		ctx.stroke();
		ctx.closePath();

		// highlights
		let hiCount = higlight.length;
		if (higlight && hiCount) {
			let tempStore = {};
			let tempLook = {};
			MotionGuidePlugin._solveGuideData(guideData, tempStore);

			for (let i = 0; i < hiCount; i++) {
				tempStore.orient = "fixed";
				MotionGuidePlugin._ratioToPositionData(higlight[i], tempStore, tempLook);

				ctx.beginPath();
				ctx.moveTo(tempLook.x, tempLook.y);
				ctx.lineTo(
					tempLook.x + Math.cos(tempLook.rotation * 0.0174533) * length,
					tempLook.y + Math.sin(tempLook.rotation * 0.0174533) * length
				);
				ctx.strokeStyle = "black";
				ctx.lineWidth = width * 1.5;
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
	}
// private methods
	/**
	 * Calculate and store optimization data about the desired path to improve performance and accuracy of positions.
	 * @param {Object} source The guide data provided to the tween call
	 * @param {Object} storage the guide data used by the step calls and plugin to do the job, will be overwritten
	 * @returns {String} Can return an error if unable to generate the data.
	 * @private
	 */
	static _solveGuideData (source, storage) {
		let err = MotionGuidePlugin.debug(source);
		if (err) { return err; }

		let path = storage.path = source.path;
		let orient = storage.orient = source.orient;
		storage.subLines = [];
		storage.totalLength = 0;
		storage.startOffsetRot = 0;
		storage.deltaRotation = 0;
		storage.startData = { ratio: 0 };
		storage.endData = { ratio: 1 };
		storage.animSpan = 1;

		let pathLength = path.length;

		let precision = 10;
		let temp = {};
		let sx, sy, cx, cy, ex, ey, i, j, len;

		sx = path[0];
		sy = path[1];

		// get the data for each curve
		for (i = 2; i < pathLength; i += 4) {
			cx = path[i];
			cy = path[i + 1];
			ex = path[i + 2];
			ey = path[i + 3];

			let subLine = {
				weightings: [],
				estLength: 0,
				portion: 0
			};

			let subX = sx,
					subY = sy;
			// get the distance data for each point
			for (j = 1; j <= precision; j++) { // we need to evaluate t = 1 not t = 0
				MotionGuidePlugin._getParamsForCurve(sx, sy, cx, cy, ex, ey, j / precision, false, temp);

				let dx = temp.x - subX,
						dy = temp.y - subY;
				len = Math.sqrt(dx * dx + dy * dy);
				subLine.weightings.push(len);
				subLine.estLength += len;

				subX = temp.x;
				subY = temp.y;
			}

			// figure out full lengths
			storage.totalLength += subLine.estLength;

			// use length to figure out proportional weightings
			for (j = 0; j < precision; j++) {
				len = subLine.estLength;
				subLine.weightings[j] = subLine.weightings[j] / len;
			}

			storage.subLines.push(subLine);
			sx = ex;
			sy = ey;
		}

		// use length to figure out proportional weightings
		len = storage.totalLength;
		let l = storage.subLines.length;
		for (i = 0; i < l; i++) {
			storage.subLines[i].portion = storage.subLines[i].estLength / len;
		}

		// determine start and end data
		let startRatio = isNaN(source.start) ? 0 : source.start;
		let endRatio = isNaN(source.end) ? 1 : source.end;
		MotionGuidePlugin._ratioToPositionData(startRatio, storage, storage.startData);
		MotionGuidePlugin._ratioToPositionData(endRatio, storage, storage.endData);

		// this has to be done last else the prev ratios will be out of place
		storage.startData.ratio = startRatio;
		storage.endData.ratio = endRatio;
		storage.animSpan = storage.endData.ratio - storage.startData.ratio;
	}

	/**
	 * Convert a percentage along the line into, a local line (start, control, end) t-value for calculation.
	 * @param {Number} ratio The (euclidean distance) percentage into the whole curve.
	 * @param {Object} guideData All the information describing the guide to be followed.
	 * @param {Object} output Object to save output properties of x,y, and rotation onto.
	 * @returns {Object} The output object, useful for isolated calls.
	 * @private
	 */
	static _ratioToPositionData (ratio, guideData, output) {
		let lineSegments = guideData.subLines;

		let i, l, t, test, target;

		let look = 0;
		let precision = 10;
		let effRatio = (ratio * guideData.animSpan) + guideData.startData.ratio;

		// find subline
		l = lineSegments.length;
		for (i = 0; i < l; i++) {
			test = lineSegments[i].portion;
			if (look + test >= effRatio) { target = i; break; }
			look += test;
		}

		if (target === undefined) {
			target = l - 1;
			look -= test;
		}

		// find midline weighting
		let subLines = lineSegments[target].weightings;
		let portion = test;
		l = subLines.length;
		for (i = 0; i < l; i++) {
			test = subLines[i] * portion;
			if (look + test >= effRatio) { break; }
			look += test;
		}

		// translate the subline index into a position in the path data
		target = (target * 4) + 2;
		// take the distance we've covered in our ratio, and scale it to distance into the weightings
		t = (i / precision) + (((effRatio - look) / test) * (1 / precision));

		// position
		let pathData = guideData.path;
		MotionGuidePlugin._getParamsForCurve(
			pathData[target - 2], pathData[target - 1],
			pathData[target], pathData[target + 1],
			pathData[target + 2], pathData[target + 3],
			t,
			guideData.orient,
			output
		);

		if (guideData.orient) {
			if (ratio >= 0.99999 && ratio <= 1.00001 && guideData.endAbsRot !== undefined) {
				output.rotation = guideData.endAbsRot;
			} else {
				output.rotation += guideData.startOffsetRot + (ratio * guideData.deltaRotation);
			}
		}

		return output;
	}

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
	_getParamsForCurve (sx, sy, cx, cy, ex, ey, t, orient, output) {
		let inv = 1 - t;

		// finding a point on a bezier curve
		output.x = inv * inv * sx + 2 * inv * t * cx + t * t * ex;
		output.y = inv * inv * sy + 2 * inv * t * cy + t * t * ey;

		// finding an angle on a bezier curve
		if (orient) {
			// convert from radians back to degrees
			output.rotation = 57.2957795 * Math.atan2(
				(cy - sy) * inv + (ey - cy) * t,
				(cx - sx) * inv + (ex - cx) * t
			);
		}
	}

	/**
	 * Perform a check to validate path information so plugin can avoid later error checking.
	 * @param {Object} guideData All the information describing the guide to be followed.
	 * @returns {String} The problem found, or undefined if no problems.
	 * @private
	 */
	static _findPathProblems (guideData) {
		let path = guideData.path;
		let valueCount = (path && path.length) || 0; // ensure this is a number to simplify later logic
		if (valueCount < 6 || (valueCount - 2) % 4) {
			return `
				Cannot parse 'path' array due to invalid number of entries in path.
				There should be an odd number of points, at least 3 points, and 2 entries per point (x & y).
				See 'CanvasRenderingContext2D.quadraticCurveTo' for details as 'path' models a quadratic bezier.

				Only ${valueCount} values found. Expected: ${Math.max(Math.ceil((valueCount - 2) / 4) * 4 + 2, 6)}.
			`;
		}

		if (!path.every(data => !isNaN(data))) {
			return "All data in path array must be numeric";
		}

		let start = guideData.start;
		if (isNaN(start) && !(start === undefined) /* || start < 0 || start > 1*/ ) { // outside 0-1 is unpredictable, but not breaking
			return `'start' out of bounds. Expected 0 to 1, got: ${start}`;
		}
		let end = guideData.end;
		if (isNaN(end) && (end !== undefined) /* || end < 0 || end > 1*/ ) { // outside 0-1 is unpredictable, but not breaking
			return `'end' out of bounds. Expected 0 to 1, got: ${end}`;
		}

		let orient = guideData.orient;
		if (orient) { // mirror the check used elsewhere
			if (orient != "fixed" && orient != "auto" && orient != "cw" && orient != "ccw") {
				return `Invalid orientation value. Expected ["fixed", "auto", "cw", "ccw", undefined], got: ${orient}`;
			}
		}

		return undefined;
	}

}


// static properties:
/**
 * @property priority
 * @protected
 * @static
 */
MotionGuidePlugin.priority = 0; // high priority, should run sooner

/**
 * READ-ONLY. A unique identifying string for this plugin. Used by TweenJS to ensure duplicate plugins are not installed on a tween.
 * @property ID
 * @type {String}
 * @static
 * @readonly
 */
MotionGuidePlugin.ID = "MotionGuide";
