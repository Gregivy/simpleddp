[![npm version](https://badge.fury.io/js/simpleddp.svg)](https://badge.fury.io/js/simpleddp)
[![Build Status](https://travis-ci.org/Gregivy/simpleddp.svg?branch=master)](https://travis-ci.org/Gregivy/simpleddp)
[![Dependency Status](https://david-dm.org/gregivy/simpleddp.svg)](https://david-dm.org/gregivy/simpleddp)
[![devDependency Status](https://david-dm.org/gregivy/simpleddp/dev-status.svg)](https://david-dm.org/gregivy/simpleddp#info=devDependencies)

<p align="center">
  <img width="300" height="300" src="./simpleddp.png">
</p>

# SimpleDDP 🥚

The aim of this library is to simplify the process of working with Meteor.js server over DDP protocol using external JS environments (like Node.js, Cordova, Ionic, ReactNative, etc).

It is battle tested 🏰 in production and ready to use 🔨.

If you like this project ⭐ is always welcome.

**Important**

SimpleDDP is written in ES6 and uses modern features like *promises*. Though its precompiled with Babel, your js environment must support ES6 features. So if you are planning to use SimpleDDP be sure that your js environment supports ES6 features or include polyfills yourself (like Babel Polyfill).

Project uses [semantic versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [CHANGE LOG](./CHANGELOG.md)

## Install

`npm install simpleddp --save`

## [API](./api.md)

## Plugins

* [simpleddp-plugin-login](https://github.com/Gregivy/simpleddp-plugin-login)

## Example

First of all you need WebSocket implementation for your node app.
We will use [isomorphic-ws](https://www.npmjs.com/package/isomorphic-ws) package for this
since it works on the client and serverside.

`npm install isomorphic-ws ws --save`

Import/require `simpleDDP`.

```javascript
const simpleDDP = require("simpleddp"); // nodejs
const ws = require("isomorphic-ws");
```

or

```javascript
import simpleDDP from 'simpleDDP'; // ES6
import ws from 'isomorphic-ws';
```

Now you should make a new simpleDDP instance.

```javascript
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
  let nextSub = server.subscribe("next_pub"); // subscribing after userSub is ready
  await nextSub.ready();
  //all subs are ready here
})();
```

You can fetch all things you've subscribed for using [server.collection](./api.md#collection) method.
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
