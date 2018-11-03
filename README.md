# redux-suspenders

![npm](https://img.shields.io/npm/v/redux-suspenders.svg)
![NpmLicense](https://img.shields.io/npm/l/redux-suspenders.svg)

Tie into React's Suspense API with a Redux app

## Setup
```js
npm install --save redux-suspenders
```

## Usage
Redux-suspenders offers a single function as the default export, called createResource.

### Defining the resource
```js
import createResource from 'redux-suspenders';

const fetchGithubAccount = username => fetch(`https://github.com/users/${username}`)
    .then(response => response.json());

//Assume some reducer listens for this action
const setUser = user => ({
  type: 'SET_USER_DATA',
  payload: user
});

const loadData = (props) => fetchGithubAccount(props.username);
const selectData = (state, props) => state.users[props.username]
const updateData = (response, props) => setUser(response);

//The result of createResource() is a React.Component
export const GithubUserResource = createResource(
  loadData,   //Must either return a Promise directly, or return a Promise when dispatched
  selectData, //Should return falsy value when data doesn't exist
  updateData  //Should update the data read by the selector
);

```

### Consuming the resource

Any Resource accepts a function as a child, which will only get called once there is data in the redux store. All props given to your Resource will be provided as the last argument to all of the functions passed into the createResource call.

```js
  import React, { Suspense } from 'react';
  import { GithubUserResource } from '../src/githubUserResource';
  
  const ShowUserInfo = ({ username }) => {
    return (
      <Suspense fallback={'Loading...'}>
        <GithubUserResource username={username}> 
          {user => (
            {/* Renders only when data is loaded into redux, otherwise renders Suspsense's fallback */}
            <div>{JSON.stringify(user, null, 2)}</div>
          )
        </GithubUserResource>
      </Suspense>
    )
  }

```

## Movitivation
React Suspense is an awesome feature, and with it, a lot of examples show off `simple-cache-provider`, or even `react-cache` as ways to asynchronously load data inside of render functions. If you're working on an idiomatic (or large) Redux application, however, utilizing these new APIs can feel either like a lot of work, or a lot of best practices will be broken (side-effects in `render`s, storing data in external caches, maybe even having to sync the cache with Redux, etc).

The good news is, if you're using Redux, you already have a client-side cache! This little library hopes to make utilizing Suspense for loading data easy for Redux applications.

Plus, it uses a render prop! So no side effects are necessary in your components!

## Considerations
The `load` function that you provide to `createResource` gets ran with any props given to the Resource component. If the result of `load` is not a promise, it will be dispatched, which must then return a Promise. 

```js
  //A redux-thunk example
  const loadSomeData = (resourceProps) => (dispatch, getState) => {
  let request;
  
  //...build request
  dispatch(({ type: 'SENDING_REQUEST' }));
  
  return fetch(request) //returns a Promise;
}
```
