/*jshint node:true, browser:true, noyield:true */
/*globals define*/
(function() {
  "use strict";

  function async(func, self) {
    return function asyncFunction() {
      const args = Array.from(arguments);
      return new Promise(function(resolve, reject) {
        var gen;
        if (typeof func !== "function") {
          reject(new TypeError("Expected a Function."));
        }
        //not a generator, wrap it.
        if (func.constructor.name !== "GeneratorFunction") {
          gen = (function *() {
            return func.call(self, ...args);
          }());
        } else {
          gen = func.call(self, ...args);
        }
        try {
          step(gen.next(undefined));
        } catch (err) {
          reject(err);
        }

        function step(next) {
          const value = next.value;
          if (next.done) {
            return resolve(value);
          }
          if (value instanceof Promise || isThenable(value)) {
            return value.then(
              result => step(gen.next(result)),
              error => {
                try {
                  step(gen.throw(error));
                } catch (err) {
                  throw err;
                }
              }
            ).catch((err) => {
              console.warn("Unhandled error in async function.", err);
              reject(err);
            });
          }
          step(gen.next(value));
        }
      });
    };
  }

  function isThenable(obj) {
    return obj && typeof obj === "object" && typeof obj.then === "function";
  }
  async.task = function(func, self) {
    return async(func, self)();
  };
  //Export it for browser, require, and node
  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = async;
  } else {
    if (typeof define === "function" && define.amd) {
      define([], function() {
        return async;
      });
    } else {
      window.async = async;
    }
  }
}).call(this);
