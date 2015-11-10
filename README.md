# async.js (Yet another)
This is a light-weight approximate implementation of
[ES7's async-await](https://github.com/tc39/ecmascript-asyncawait) pattern.

It allows for simple creation of async function and "tasks".

For example:
```js
var myThinger = {
  doAsynThing: async(function*(url){
    var result = yield fetch(url);
    return process(result);
  });
}
```

And task-like things can be created as follows:

```js
var myTask = async.task(function*{
 var result = yield fetch(url);
 return result;
}).then(doSomethingElse);
```
