/*jshint node:true, browser:true */
(function(exports){
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
          gen = (function*() {
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
          if (value instanceof Promise) {
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
  async.task = function(func, self) {
    return async(func, self)();
  };
  if(this.exports){
    exports.async = async;
  }else{
    this.async = async;
  }
}).call(this);
