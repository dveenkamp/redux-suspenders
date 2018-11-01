# redux-atoms
Treat multiple Redux updates as one change

## Setup
```js
npm install --save redux-atoms
```
Then, in your application, add atomMiddleware to your middleware chain (preferably near to last), and pass your root reducer into enhanceReducer.

```js
import { createStore, applyMiddleware } from 'redux';
import { atomMiddleware, enhanceReducer } from 'redux-atoms';
import rootReducer from './reducers/index';

const store = createStore(
  enhanceReducer(rootReducer),
  applyMiddleware(atomMiddleware)
);
```

## Usage
```js
import { atom } from 'redux-atoms';

const increment = () => {
  return {
    type: 'INCREMENT'
  };
};

const incrementBy3 = () => atom({
  name: 'INCREMENT_BY_3', //name isn't used for anything except for semantics and logging
  actions: [
    increment(),
    increment(),
    increment()
  ]
});

store.dispatch(incrementBy3()); //Increment gets dispatched 3 times, store only updates once!
```

Atomicity is preserved for these actions as well (where the name redux-atoms comes from...), meaning that if another action gets dispatched before `store.dispatch(incrementBy3())` is finished, it will be placed on a queue, and will be re-dispatched once the atomic update is finished...

```js
// Let's say you have a custom middleware that dispatches an action whenever it sees 'INCREMENT' actions
const incrementMiddleware = store => next => action => {
  if(action.type === 'INCREMENT') {
    dispatch({ type: 'SAW_AN_INCREMENT!' })
  }
  return next(action);
};

//(assume it gets applied to the middleware chain before atomMiddleware)

store.dispatch(incrementBy3());

/**
Here's what our log will look like:

'INCREMENT'
'INCREMENT'
'INCREMENT'
'SAW_AN_INCREMENT'
'SAW_AN_INCREMENT'
'SAW_AN_INCREMENT'
*/
```

## Movitivation
I've never worked on a redux application that I haven't used redux-thunk in, or some other way to dispatch multiple redux actions together. The problem is that there is no "at once" with redux; any time an action is dispatched, that creates a brand new store (assuming immutability principles are followed). If I have 3 actions I need to dispatch, I make 3 new instances of the state, which could lead to 3 new renders of the application. Not to mention, it's possible for things to go wrong while executing those actions.

Semantically, we want one action that says "SUBMIT_MY_FORM", but because of how reducers are often structured, we dispatch 3 actions that end up submitting the form, without saying so. We lose context in our debugging, as well as our understanding of the application flow.

Instead of going from `stateA -> stateB -> stateC`,

let's just go from `stateA -> stateC`!

Enter redux-atoms. Simply wrap all of the actions you want dispatched together, and BAM! Atomic redux updates.

## Considerations
Redux-atoms currently relies on a plain JS object structure. If you're using redux-immutable, this won't work for you just yet.

Also, nested atoms and async atoms are not implemented, and will not work!

```js
const nestedAtomicUpdate = () => atom({
  name: 'FIRST_LEVEL',
  actions: [
    atom({
      name: 'DONT_DO_THIS',
      actions: [
        action1(),
        action2()
      ]
    })
  ]
```
