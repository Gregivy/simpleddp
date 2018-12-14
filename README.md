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

If you like this project, you can make a donation 🌟
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6UKK8XDLFYQ5C)

**Important**

SimpleDDP is written in ES6 and uses modern features like *promises*. Though its precompiled with Babel, your js environment must support ES6 features. So if you are planning to use SimpleDDP be sure that your js environment supports ES6 features or include polyfills yourself (like Babel Polyfill).

## Install

`npm install simpleddp --save`

## [API](./api.md)

## Contents

* [Plugin system](#plugin-system)
* [Usage (node.js example)](#usage-nodejs-example)
* [Tips](#tips)
* [Ionic 3 Example](./docs/examples/ionic3/README.md)
* [API v1.1.8](./docs/api.md)

## Plugin system

SimpleDDP supports plugins *(>= v1.1.7)* 🎉.
To use a plugin pass every plugin object you want in array as a second argument to `simpleDDP` constructor.

```javascript
const simpleDDP = require("simpleddp").default;
const simpleDDPLogin = require("simpleddp-plugin-login").simpleDDPLogin;

let opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: WebSocket,
    reconnectInterval: 5000
};
const server = new simpleDDP(opts,[simpleDDPLogin]);
```

### Plugins list

#### 🔐 simpleddp-plugin-login (Meteor.Accounts login)

`npm install simpleddp-plugin-login --save`

Adds support for Meteor.Accounts login. See [readme](https://github.com/gregivy/simpleddp-plugin-login).

### [Create a plugin](./docs/plugins.md)

## Usage (node.js example)

First of all you need WebSocket implementation for your node app. We will use [ws](https://www.npmjs.com/package/ws) package for this.

`npm install ws --save`

Now you should make a new simpleDDP instance.

```javascript
const simpleDDP = require("simpleddp").default;
const ws = require("ws");

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
let userSub = server.sub("user_pub");
let otherSub = server.sub("other_pub",['param1',2]); // you can specify arguments for subscription in array

(async ()=>{
  await userSub.ready();
  let nextSub = server.sub("next_pub", [server.collections.users[0]._id]); // subscribing after userSub is ready
  await nextSub.ready();
  //all subs are ready here
})();
```

You can find all things you've subscribed for in `server.collections` property. It's a simple js object with fields named after collections. Collection itself is a plain js array which consists of mongo documents sent by server. You can also use `server.collection` with `ddpFilter` to observe changes:

```javascript
(async ()=>{
  let userSub = server.sub("user",[userId]);
  await userSub.ready();
  let current_user = server.collections.users.find(user=>user.id==userId);

  // or you can server.collection
  let the_same_user = server.collection('users').filter(user=>user.id==userId).fetch()[0];

  // observing the changes
  server.collection('users').filter(user=>user.id==userId).onChange(({prev,next})=>{
    console.log('previus user data',state.prev);
    console.log('next user data',state.next);
  });
})();
```

## Tips

If your meteor production server goes down and then restarts the server will suffer from a huge load
because everyone who was connected via WebSockets will try to reconnect almost at the same time.
The suggested solution is to set random reconnectInterval: `reconnectInterval: Math.round(1000 + 4000 * Math.random())`
