/*globals module*/
// Karma configuration
// Generated on Thu Aug 13 2015 23:57:08 GMT-0400 (EDT)

module.exports = function(config) {
  "use strict";
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "chai-as-promised", "chai", "detectBrowsers"],

    // configuration
    detectBrowsers: {
      enabled: true,
      usePhantomJS: false,
      postDetection: function(browsers) {
        // no Safari support, because no generators
        return browsers.filter(browser => browser !== "Safari" );
      }
    },

    // list of files / patterns to load in the browser
    files: [,
      "lib/async.js",
      "test/**/*.js",
    ],

    // list of files to exclude
    exclude: [
      ".DS_Store"
    ],

    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["progress"],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["FirefoxNightly"],

    browserNoActivityTimeout: 10000,

    browserDisconnectTimeout: 2000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};

