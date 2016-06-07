/*jshint node:true, browser:true, noyield:true, esnext: true */
/*globals define*/
"use strict"; {
  // async function takes a generator, and optional "this"
  function async(func, self) {
    // returns returns a function asyncFunction that returns promise
    // It is called with zero or more arguments...
    return function asyncFunction(...args) {
      return new Promise((resolve, reject) => {
        if (typeof func !== "function") {
          return reject(new TypeError("Expected a function."));
        }
        const gen = func.call(self, ...args);
        if (func.constructor.name !== "GeneratorFunction") {
          return resolve(gen);
        }

        try {
          step(gen.next());
        } catch (err) {
          reject(err);
        }

        function step({ value, done }) {
          if (done) {
            return resolve(value);
          }
          if (!isThenable(value)) {
            return step(gen.next(value));
          }
          // Thenable might not have catch(), so we try .then() and .catch()
          try {
            value.then(
              result => step(gen.next(result)),
              error => step(gen.throw(error))
            );
            if (value.catch) {
              value.catch(reject);
            }
          } catch (err) {
            reject(err);
          }
        }
      });
    };
  }

  async.task = (func, self) => async(func, self)();

  function isThenable(obj) {
    return obj instanceof Promise || (typeof obj === "object" && typeof obj.then === "function");
  }

  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = async;
  } else if (typeof define === "function" && define.amd) {
    define([], () => async);
  } else {
    window.async = async;
  }
}
