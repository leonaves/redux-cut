# 🎬 Redux Cut
Middleware to block redux actions based on provided criteria.

## What's it for?
Redux Cut is middleware for the [Redux framework](https://github.com/reactjs/redux) which enables you to block certain actions from firing, based on certain criteria.

The middleware intercepts these actions and instead dispatches a "blocked action" action which you can listen for in your reducer using `isBlockedAction`.

The new action includes the original action as its payload. You can use this to help with the implementation of protected functionality, permissions, or simply as a way to group this sort of functionality which you may have had in your reducers.

### Can't I do this kind of thing with [insert some other library]?
Definitely. Redux Cut just provides a certain way of going about things that you may prefer to other methods.

## How do I use it?

You can install Redux Cut through NPM:

```
npm install redux-cut --save
```

Import it:

```js
import cut from 'redux-cut'; // Or your module import syntax of choice
```

Then apply it to your store like so:

```js
let store = createStore(reducer, initialState, applyMiddleware(cut(criteria), ...otherMiddlewares));
```

You'll notice that the imported `cut` function takes a single argument which then returns the middleware itself. This function (the criteria function), is one which you must provide, which determines whether actions are allowed to be dispatched. The function is passed two arguments, the current state of your store, and the action dispatched.

This signature will feel incredibly familiar to you if you if you have used Redux's reducers (which presumably you have or you probably wouldn't be reading this); the only difference is that instead of returning a new version of the state, you return `false` if the action is not permitted. You may return `true` to allow the function to be dispatched, but you may also return nothing at all, the middleware doesn't care about the return value of this function unless it is false. Let's look at an example:

```js
const permitActions = (state, action) => {
    switch(action.type) {
        case 'DELETE_ALL_CUSTOMER_INFORMATION':
            return 'manager' === state.currentUser.role;
        case 'INSERT_NEW_RECORD':
            if (state.records.entries.size() >= state.records.maxSize) {
                return false;
            }
    }
};

export default permitActions;
```

Obviously Redux Cut isn't meant to be a replacement for a real server validated permissions system (someone trying to delete all records could probably work out how to set their role to manager through the console), it can be handy to provide some immediate user feedback in cases where permissions might be denied at the server level. You may also use it for soft validation on non-destructive actions like attempting to exceed the maximum size of some data store. I'm sure you could come up with other uses too.

### Combining Criteria
Much like Redux's reducers, you can also combine multiple criteria functions into a single function using the provided `combineCriteria` function:

#### `action-criteria/index.js`
```js
import { combineCriteria } from 'redux-cut'
import playlistCriteria from './playlist'
import songCriteria from './song'

export default combineCriteria({
  playlistCriteria,
  songCriteria
})
```

#### `App.js`
```js
import criteria from './action-criteria/index';

let store = createStore(reducer, initialState, applyMiddleware(cut(criteria), ...otherMiddlewares));
```

### Listening for blocked actions
You can listen for blocked actions by importing the avilable `isBlockedAction` function:

```js
import { isBlockedAction } from '../index';

if (isBlockedAction(action)) {
  return { modalVisible: true, message: 'Sorry you, can\'t do that!' }
}
```

## Order of middleware
This one is fairly self explanatory, middleware applied before your Redux Cut will receive the original action, while middleware after will get the blocked action.

```js
applyMiddleware(myLoggingMiddleware, cut(criteria), ...otherMiddlewares));
```

Here, myLoggingMiddleware will receive the action as-is, while all other middlewares will receive the blocked version.

## Is it redux-devtools friendly?
You bet! Apply it before `Devtools.instrument()` and you'll see this in your monitor:

<img src='https://raw.githubusercontent.com/leonaves/redux-cut/26098e1bc89736c6b1f867067a2e02a384fb37ba/devtools-screenshot.png'/>

Like so, if you aren't completely familiar with the concept:

```js
enhancer = compose(
    applyMiddleware(cut(criteria), APIMiddleware),
    DevTools.instrument()
);
```
