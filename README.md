[![npm version](https://badge.fury.io/js/simpleddp.svg)](https://badge.fury.io/js/simpleddp)
[![Build Status](https://travis-ci.org/Gregivy/simpleddp.svg?branch=master)](https://travis-ci.org/Gregivy/simpleddp)
[![Dependency Status](https://david-dm.org/gregivy/simpleddp.svg)](https://david-dm.org/gregivy/simpleddp)
[![devDependency Status](https://david-dm.org/gregivy/simpleddp/dev-status.svg)](https://david-dm.org/gregivy/simpleddp#info=devDependencies)

<p align="center">
  <img width="300" height="300" src="https://github.com/Gregivy/simpleddp/raw/2.x.x/simpleddp.png">
</p>

# SimpleDDP 🥚

The aim of this library is to simplify the process of working with Meteor.js server over DDP protocol using external JS environments (like Node.js, Cordova, Ionic, ReactNative, etc).

It is battle tested 🏰 in production and ready to use 🔨.

If you like this project ⭐ is always welcome.

**Important**

SimpleDDP is written in ES6 and uses modern features like *promises*. Though its precompiled with Babel, your js environment must support ES6 features. So if you are planning to use SimpleDDP be sure that your js environment supports ES6 features or include polyfills yourself (like Babel Polyfill).

Project uses [semantic versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [CHANGE LOG](https://github.com/Gregivy/simpleddp/blob/2.x.x/CHANGELOG.md)

## Install

`npm install simpleddp --save`

## [API](https://github.com/Gregivy/simpleddp/blob/2.x.x/api.md)

## Plugins

* [simpleddp-plugin-login](https://github.com/Gregivy/simpleddp-plugin-login)

<<<<<<< HEAD
- Added mocha testing (>= v1.1.0).
- New `onChange` approach, `simpleDDP.onChange` removed. For more info see [simpleDDP.collection](./docs/api.md#simpleddpcollection) (>= v1.1.0).
- `simpleDDP.stopChangeListeners()` is introduced instead of `simpleDDP.stopOnChange()`, see [simpleDDP.stopChangeListeners()](./docs/api.md#simpleddpstopchangelisteners) (>= v1.1.0).
- `simpleDDP.connect` now returns *Promise* (>= v1.1.1).
- `ddpSubscription` has `ready()` method which returns *Promise* (>=v1.1.1).
- Fixed bug with `new simpleDDP(opts)` where `opts.autoConnect == false` (>=v1.1.5).
- Fixed bug with `ddpSubscription.ready()` promise (>=v1.1.5).
- `simpleDDP.disconnect` now returns *Promise* (>= v1.1.6).
- Added plugin system (>= v1.1.7) (see [plugins](#plugin-system)).
- New documentation (>= v1.1.7).
- Fixed bug with `opts.autoReconnect==true` (>= v1.1.7).
- `simpleDDP.collection` and `ddpFilter` now return `[]` if no collection found (>= v1.1.8).
- Fixed bug with filtering the removed object (>= v1.1.9).
- Shallow copying was replaced with deep cloning js objects in `ddpCollection.fetch()`, `ddpFilter.fetch()`
  and in `ddpCollection.onChange()`, `ddpFilter.onChange()` (>= v1.1.9).
- `ddpFilter.onChange()` triggers even when a next state of an object successfully passes the filter.
  If `prev` and `next` are both not `false` you can check which passes the filter with new argument `predicatePassed`.
  It is an array of two *booleans*, `predicatePassed[0]` is for `prev` and `predicatePassed[1]` is for `next` (>= v1.1.9).
- Fixed bug with mutating `EventEmitter` message on `ready` event. **This leaded to never occurring readiness of a subscription** (>= v1.1.10).
- Fixed bug with wrong checking of subscription readiness (>= v1.1.10).
=======
## [Adding custom EJSON types](https://github.com/Gregivy/simpleddp/blob/2.x.x/custom_ejson.md) ⭐
>>>>>>> 2.x.x

## Example

<<<<<<< HEAD
* [Plugin system](#plugin-system)
* [Usage (node.js example)](#usage-nodejs-example)
* [Tips](#tips)
* [Ionic 3 Example](./docs/examples/ionic3/README.md)
* [API v1.1.10](./docs/api.md)
=======
First of all you need WebSocket implementation for your node app.
We will use [isomorphic-ws](https://www.npmjs.com/package/isomorphic-ws) package for this
since it works on the client and serverside.
>>>>>>> 2.x.x

`npm install isomorphic-ws ws --save`

Import/require `simpleDDP`.

```javascript
<<<<<<< HEAD
const simpleDDP = require("simpleddp").default;
const ws = require('isomorphic-ws');
const simpleDDPLogin = require("simpleddp-plugin-login").simpleDDPLogin;

let opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: ws, // Use a socket that works on client and serverside
    reconnectInterval: 5000
};
const server = new simpleDDP(opts,[simpleDDPLogin]);
=======
const simpleDDP = require("simpleddp"); // nodejs
const ws = require("isomorphic-ws");
>>>>>>> 2.x.x
```

or

<<<<<<< HEAD
#### 🔐 simpleddp-plugin-login (Meteor.Accounts login)

`npm install simpleddp-plugin-login --save`

Adds support for Meteor.Accounts login. See [readme](https://github.com/gregivy/simpleddp-plugin-login).

### [Create a plugin](./docs/plugins.md)

## Usage (node.js example)

First of all you need WebSocket implementation for your node app. We will use [isomorphic-ws](https://www.npmjs.com/package/isomorphic-ws) package for this since it works on the client and serverside.

`npm install isomorphic-ws --save`
=======
```javascript
import simpleDDP from 'simpleDDP'; // ES6
import ws from 'isomorphic-ws';
```
>>>>>>> 2.x.x

Now you should make a new simpleDDP instance.

```javascript
<<<<<<< HEAD
const simpleDDP = require("simpleddp").default;
const ws = require("isomorphic-ws");

=======
>>>>>>> 2.x.x
let opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: ws,
    reconnectInterval: 5000
};
const server = new simpleDDP(opts);
```

Connection is not going to be established immediately after you create a simpleDDP instance. If you need to check your connection simply use `server.connected` property which is `true` if you are connected to the server, otherwise it's `false`.

You can also add some events for connection status.

```javascript
server.on('connected', () => {
    // do something
});

server.on('disconnected', () => {
    // for example show alert to user
});
```

As an alternative you can use a *async/await* style (or `then(...)`).

```javascript
(async ()=>{
  await server.connect();
  // connection is ready here
})();
```

The next thing we are going to do is subscribing to some publications.

```javascript
let userSub = server.subscribe("user_pub");
let otherSub = server.subscribe("other_pub",'param1',2); // you can specify arguments for subscription

(async ()=>{
  await userSub.ready();
<<<<<<< HEAD
  let nextSub = server.sub("next_pub", [server.collections.users[0].id]); // subscribing after userSub is ready
=======
  let nextSub = server.subscribe("next_pub"); // subscribing after userSub is ready
>>>>>>> 2.x.x
  await nextSub.ready();
  //all subs are ready here
})();
```

You can fetch all things you've subscribed for using [server.collection](https://gregivy.github.io/simpleddp/simpleDDP.html#collection) method.
Also you can get reactive data sources (plain js objects which will be automatically updated if something changes on the server).


```javascript
(async ()=>{

  // call some method
  await server.call('somemethod');

  let userSub = server.subscribe("user",userId);
  await userSub.ready();

  // get non-reactive user object
  let user = server.collection('users').filter(user=>user.id==userId).fetch()[0];

  // get reactive user object
  let userReactiveCursor = server.collection('users').filter(user=>user.id==userId).reactive().one();
  let userReactiveObject = userReactiveCursor.data();

  // observing the changes
  server.collection('users').filter(user=>user.id==userId).onChange(({prev,next})=>{
    console.log('previus user data',state.prev);
    console.log('next user data',state.next);
  });

  // observing changes in reactive data source
  userReactiveCursor.onChange((newData)=>{
    console.log('new user state', newData);
  });

  let participantsSub = server.subscribe("participants");

  await participantsSub.ready();

  let reactiveCollection = server.collection('participants').reactive();

  // reactive reduce
  let reducedReactive = reactiveCollection.reduce((acc,val,i,arr)=>{
    if (i<arr.length-1)  {
      return acc + val.age;
    } else {
      return (acc + val.age)/arr.length;
    }
  },0);

  // reactive mean age of all participants
  let meanAge = reducedReactive.data();

  // observing changes in reactive data source
  userReactiveCursor.onChange((newData)=>{
    console.log('new user state', newData);
  });
})();
```
