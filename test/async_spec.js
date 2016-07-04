'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
const async = require('marcosc-async');

describe('async API', () => {

  it('handles an immediately throwing sync function.', () => {
    const error = new Error('test error');
    const test = async(function() {
      throw error;
    });

    return test().should.be.rejectedWith(error);
  });

  it('handles an immediately catch/throw sync function.', () => {
    const error1 = new Error('error 1');
    const error2 = new Error('error 2');
    const test = async(function() {
      try {
        throw error1;
      } catch (err) {
        throw error2;
      }
    });

    return test().should.be.rejectedWith(error2);
  });

  it('recovers from nested sync exceptions.', () => {
    const error1 = new Error('error 1');
    const error2 = new Error('error 2');
    const test = async(function() {
      try {
        throw error1;
      } catch (err) {
        try {
          throw error2;
        } catch (err) {}
      }

      return 'pass';
    });

    return test().should.become('pass');
  });

  it('returns returns a function that returns promise.', () => {
    const funct = async(function*() {
      return 'pass';
    });

    (typeof funct).should.equal('function');
    const promise = funct();
    promise.should.be.instanceof(Promise);
    return promise.should.become('pass');
  });

  it('rejects when called with non-callable.', () => {
    const promise = Promise.all([
      async()().should.be.rejectedWith(TypeError),
      async(null)().should.be.rejectedWith(TypeError),
      async('a string')().should.be.rejectedWith(TypeError),
      async({})().should.be.rejectedWith(TypeError),
    ]);

    return promise;
  });

  it('immediately resolves when passed function.', () => {
    const test = async(() => 'pass');
    return test().should.eventually.become('pass');
  });

  it('accepts multiple arguments.', () => {
    const test = async(function(arg1, arg2, arg3) {
      let result = {arg1, arg2, arg3, length: arguments.length};
      return result;
    });

    return test(1, 2, 3)
      .then(
        result => result.should.deep.eql({arg1: 1, arg2: 2, arg3: 3, length: 3})
      );
  });

  it('asynchronously resolves to the value of a resolved promise.', () => {
    const test = async(function*() {
      return yield Promise.resolve().then(() => 'pass');
    });

    return test().should.eventually.become('pass');
  });

  it('rejects when the generator throws.', () => {
    const error = new Error('testing111');
    const test = async(function*() {
      throw error;
    });

    return test().should.be.rejectedWith(error);
  });

  it('recovers and returns in a catch.', () => {
    const error = new Error('');
    const test = async(function*() {
      try {
        yield Promise.reject(error);
      } catch (err) {
        return 'pass';
      }

      return 'fail';
    });

    return test().should.become('pass');
  });

  it('rejects after throwing.', () => {
    const error = new Error('Error');
    const test = async(function*() {
      try {
        yield Promise.reject(error);
      } catch (err) {
        throw err;
      }
    });

    return test().should.be.rejectedWith(error);
  });

  it('recovers from rejection.', () => {
    const test = async(function*() {
      try {
        yield Promise.reject(new Error('pass'));
      } catch (error) {
        return error.message;
      }
    });

    return test().should.become('pass');
  });

  it('recovers from rejection and continues asynchronously.', () => {
    const test = async(function*() {
      let err = '';
      try {
        yield Promise.reject(new Error('exception_'));
      } catch (ex) {
        err = ex.message;
      }

      const w = yield Promise.resolve('recovered_').then((v) => err + v);
      const z = yield Promise.resolve('123').then((v) => w + v);
      return z; //exception_recovered_123
    });

    return test().should.eventually.become('exception_recovered_123');
  });

  it('recovers from rejection, then resolves with a string.', () => {
    const test = async(function*() {
      try {
        yield Promise.reject(new Error());
      } catch (err) {}

      const w = yield 'recovered';
      const y = yield w + `123`;
      const z = yield Promise.resolve(y);
      return z;
    });

    return test().should.become('recovered123');
  });

  it('accepts an argument.', () => {
    const test = async(function*(arg1) {
      return arg1;
    });

    return test('pass').should.become('pass');
  });

  describe('binding tests', () => {
    const obj = {value: '123', value2: 321};

    it('binds correctly when passed an object to bind to.', () => {
      const test = async(function*(arg1) {
        let result = {
          value: this.value === '123',
          value2: this.value2 === 321,
          arg1: arg1 === undefined,
        };
        return result;
      }, obj);

      const testResult = {value: true, value2: true, arg1: true};
      return test().should.eventually.deep.equal(testResult);
    });

    it('binds and accepts arguments.', () => {
      const test = async(function*(arg1, arg2, arg3) {
        let t1 = yield(this.value === '123');
        let t2 = yield(this.value2 === 321);
        let t3 = yield(arg1 === 1);
        let t4 = yield(arg2 === 2);
        let t5 = yield(arg3 === 3);
        let t6 = yield(arguments.length === 3);
        let r = yield(t1 && t2 && t3 && t4 && t5 && t6); //All should be true
        return r;
      }, obj);

      return test(1, 2, 3).should.become(true);
    });
  });

  describe('Thenable compatibility', () => {
    it('resolves a thenable.', () => {
      const test = async(function*() {
        let thenable = {
          then(resolve) {
            return resolve('pass');
          },
        };
        let result = yield thenable;
        return result;
      });

      return test().should.eventually.become('pass');
    });
    it('resolves a thenable.', () => {
      const test = async(function*() {
        let thenable = {
          then(resolve, reject) {
            return reject(new Error('pass'));
          },
        };
        try {
          yield thenable;
        } catch (err) {
          return err.message;
        }

        return 'fail';
      });

      return test().should.eventually.become('pass');
    });
    it('handles a thenable throwing.', () => {
      const err = new Error('Pass');
      const test = async(function*() {
        let thenable = {
          then() {
            throw err;
          },
        };
        let result = yield thenable;
        return result;
      });

      return test().should.eventually.be.rejectedWith(err);
    });
  });

  describe('async\'s task() method', () => {
    it('is a function.', () => {
      async.should.have.property('task');
      (typeof async.task).should.equal('function');
    });
    it('works with a generator.', () => {
      const test = function*() {
        yield 'test';
        return 'pass';
      };

      return async.task(test).should.become('pass');
    });
    it('works with a function.', () => {
      const test = function() {
        return 'pass';
      };

      return async.task(test).should.eventually.become('pass');
    });
    it('rejects after throwing.', () => {
      const error = new Error('Error');

      function* test() {
        try {
          yield Promise.reject(error);
        } catch (err) {
          throw err;
        }
      }

      return async.task(test).should.eventually.be.rejectedWith(error);
    });
  });
});
