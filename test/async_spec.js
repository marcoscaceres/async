/*globals async*/
/*jshint mocha: true, noyield: true, node: true*/
"use strict";
describe("async API", () => {
  it("returns returns a function that returns promise.", () => {
    const funct = async(function*(){
      return "pass";
    });
    (typeof funct).should.equal("function");
    const promise = funct();
    promise.should.be.instanceof(Promise);
    promise.should.become("pass");
  });

  it("rejects when called with non-callable.", () => {
    async()().should.be.rejectedWith(TypeError);
    async(null)().should.be.rejectedWith(TypeError);
    async("a string")().should.be.rejectedWith(TypeError);
    async({})().should.be.rejectedWith(TypeError);
  });

  it("immediately resolves when passed function.", () => {
    const test = async(() => "pass");
    test().should.eventually.become("pass");
  });

  it("accepts multiple arguments.", (done) => {
    const test = async(function(arg1, arg2, arg3) {
      let result = {arg1, arg2, arg3, length: arguments.length};
      return result;
    });
    test(1, 2, 3)
      .then(
        result => result.should.deep.eql({arg1: 1, arg2: 2, arg3: 3, length: 3 })
      )
      .then(()=> done())
      .catch(err => console.log(err.stack));
  });

  it("asynchronously resolves to the value of a resolved promise.", () => {
    const test = async(function*() {
      return yield Promise.resolve().then(() => "pass");
    });
    test().should.eventually.become("pass");
  });

  it("rejects when the generator throws.", () => {
    const error = new Error("testing111");
    const test = async(function*() {
      throw error;
    });
    test().should.be.rejectedWith(error);
  });

  it("recovers and returns in a catch.", () => {
    const error = new Error("");
    const test = async(function*() {
      try {
        yield Promise.reject(error);
      } catch (err) {
        return "pass";
      }
      return "fail";
    });
    test().should.become("pass");
  });

  it("rejects after throwing.", () => {
    const error = new Error("Error");
    const test = async(function*() {
      try {
        yield Promise.reject(error);
      } catch (err) {
        throw err;
      }
    });
    test().should.be.rejectedWith(error);
  });

  it("recovers from rejection.", () => {
    const test = async(function*() {
      try {
        yield Promise.reject(new Error("pass"));
      } catch (error) {
        return error.message;
      }
    });
    test().should.become("pass");
  });

  it("recovers from rejection and continues asynchronously.", () => {
    const test = async(function*() {
      let err = "";
      try {
        yield Promise.reject(new Error("exception_"));
      } catch (ex) {
        err = ex.message;
      }
      const w = yield Promise.resolve("recovered_").then((v) => err + v);
      const z = yield Promise.resolve("123").then((v) => w + v );
      return z; //exception_recovered_123
    });
    var p = test();
    p.should.eventually.become("exception_recovered_123");
  });

  it("recovers from rejection, then resolves with a string.", () => {
    const test = async(function*() {
      try {
        yield Promise.reject(new Error());
      } catch (err) {}
      const w = yield "recovered";
      const y = yield w + `123`;
      const z = yield Promise.resolve(y);
      return z;
    });
    test().should.become("recovered123");
  });

  it("accepts an argument.", () => {
    const test = async(function*(arg1) {
      return arg1;
    });
    test("pass").should.become("pass");
  });

  describe("binding tests", () => {
    const obj = { value: "123", value2: 321 };

    it("binds correctly when passed an object to bind to.", () => {
      const test = async(function*(arg1) {
        let result = {
          value: this.value === "123",
          value2: this.value2 === 321,
          arg1: arg1 === undefined
        };
        return result;
      }, obj);
      test().should.eventually.deep.equal({ value: true, value2: true, arg1: true });
    });

    it("binds and accepts arguments.", () => {
      const test = async(function*(arg1, arg2, arg3) {
        let t1 = yield(this.value === "123");
        let t2 = yield(this.value2 === 321);
        let t3 = yield(arg1 === 1);
        let t4 = yield(arg2 === 2);
        let t5 = yield(arg3 === 3);
        let t6 = yield(arguments.length === 3);
        let r = yield(t1 && t2 && t3 && t4 && t5 && t6); //All should be true
        return r;
      }, obj);
      test(1, 2, 3).should.become(true);
    });
  });

  it("fetches 10 pages and resolves.", () => {
    var test = async(function*() {
      for (var i = 0; i < 10; i++) {
        var r = yield fetch("/?test=" + i);
        yield r.text();
      }
      return "pass";
    });
    test().should.become("pass");
  });

  describe("Thenable compatibility", () => {
    it("resolves a thenable.", () => {
      const test = async(function*() {
        let thenable = {
          then() {
            return Promise.resolve("true");
          }
        };
        let result = yield thenable;
        return result;
      });
      test().should.eventually.become("true");
    });
  });

  describe("async's task() method", () => {
    it("is a function.", () => {
      async.should.have.property("task");
      (typeof async.task).should.equal("function");
    });
    it("works with a generator.", () => {
      const test = function*() {
        yield "test";
        return "pass";
      };
      const p = async.task(test);
      p.catch(err => {
        debugger;
        console.log(err)
      })
      p.should.become("pass");
    });
    it("works with a function.", () => {
      const test = function() {
        return "pass";
      };
      const p = async.task(test);
      p.catch(err => {
        debugger;
        console.log(err)
      })
      p.should.eventually.become("pass");
    });
    it("rejects after throwing.", () => {
      let error = new Error("Error");
      function* test() {
        debugger;
        try {
          yield Promise.reject(error);
        } catch (err) {
          throw err;
        }
      };
      const p = async.task(test);
      p.catch(err => {
        console.log(err)
      })
      p.should.eventually.be.rejectedWith(error);
    });
  });
});
