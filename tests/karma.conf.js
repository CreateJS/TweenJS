module.exports = function (config) {
  // browsers and reporters set in gulpfile
  config.set({
    frameworks: [ "jasmine" ],
    basePath: "../",
    files: [
      // lib and sourcemaps
       "dist/tweenjs-NEXT.js",
      { pattern: "src/**/*.js", included: false },
      { pattern: "dist/tweenjs-NEXT.js.map", included: false },
      // helpers
      "tests/helpers/helpers.js",
      // specs
      "tests/spec/*.js"
    ],
    preprocessors: {
      "dist/tweenjs-NEXT.js": [ "sourcemap" ]
    }
  });
};
