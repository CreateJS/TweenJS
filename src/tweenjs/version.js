/**
 * @module TweenJS
 */
this.createjs = this.createjs || {};

(function() {
	"use strict";

	/**
	 * Static class holding library specific information such as the version and buildDate of
	 * the library.
	 * @class TweenJS
	 **/
	var s = createjs.TweenJS = createjs.TweenJS || {};

	/**
	 * The version string for this release.
	 * @property version
	 * @type String
	 * @static
	 **/
	s.version = /*version*/"NEXT"; // injected by build process

	/**
	 * The build date for this release in UTC format.
	 * @property buildDate
	 * @type String
	 * @static
	 **/
	s.buildDate = /*date*/"Mon, 22 Jul 2013 21:05:51 GMT"; // injected by build process

})();
