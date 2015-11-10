# async.js (yes, another one!)
This is a light-weight approximate implementation of
[ES7's async-await](https://github.com/tc39/ecmascript-asyncawait) pattern.

## Example
It allows for simple creation of async function and "tasks". For example:

```js
const async = require("marcosc-async");
const myThinger = {
  doAsynThing: async(function*(url){
    const response = yield fetch(url);
    const text = yield response.text();
    return process(result);
  });
}
```

And task-like things can be created as follows:

```js
const async = require("marcosc-async");
// Run immediately
const myTask = async.task(function*{
  const response = yield fetch(url);
  const text = yield response.text();
  return process(result);
}).then(doSomethingElse);
```

## Get it
You can npm install it.

```bash
npm install marcosc-async --save-dev
```
