[![npm version](https://badge.fury.io/js/simpleddp.svg)](https://badge.fury.io/js/simpleddp)
[![Build Status](https://travis-ci.org/Gregivy/simpleddp.svg?branch=master)](https://travis-ci.org/Gregivy/simpleddp)
[![Dependency Status](https://david-dm.org/gregivy/simpleddp.svg)](https://david-dm.org/gregivy/simpleddp)
[![devDependency Status](https://david-dm.org/gregivy/simpleddp/dev-status.svg)](https://david-dm.org/gregivy/simpleddp#info=devDependencies)

<p align="center">
  <img width="300" height="300" src="./simpleddp.png">
</p>

# SimpleDDP

The aim of this library is to simplify the process of working with meteor server over DDP protocol using external JS environments (like Cordova, Ionic, ReactNative, other web frontend etc).

The library is build on top of [ddp.js](https://github.com/mondora/ddp.js).

## Important

SimpleDDP is written in ES6 and uses modern features like *promises*. Though its precompiled with Babel, your js environment must support ES6 features. So if you are planning to use SimpleDDP be sure that your js environment supports ES6 features or include polyfills yourself (like Babel Polyfill).

## Tips

If your meteor production server goes down and then restarts the server will suffer from a huge load
because everyone who was connected via WebSockets will try to reconnect almost at the same time.
The suggested solution is to set random reconnectInterval: `reconnectInterval: Math.round(1000 + 4000 * Math.random())`

## Install

`npm install simpleddp --save`

## What's new in 1.1.0

- Added mocha testing
- Fixed several bugs
- New `onChange` approach, `simpleDDP.onChange` removed. For more info see [simpleDDP.collection](#simpleddpcollection).

## Roadmap

- Add plugin system
 - Create plugin for default login with Meteor Accounts
 - Create plugin for Meteor Grapher
- Test coverage
- More examples

## Contents

* [Usage (node.js example)](#usage-nodejs-example)
* [Ionic Example](#ionic-example)
* [ReactNative Example](#reactnative-example)
* [NativeScript Example](#nativescript-example)
* [Tabris.js Example](#tabrisjs-example)
* [Fusetools Example](#fusetools-example)
* [API v1.1.0](#api-v110)
  + [new simpleDDP(options)](#new-simpleddpoptions)
    - [Arguments](#arguments)
    - [Returns](#returns)
    - [Example](#example)
  + [simpleDDP.connect()](#simpleddpconnect)
    - [Arguments](#arguments-1)
    - [Returns](#returns-1)
  + [simpleDDP.disconnect()](#simpleddpdisconnect)
    - [Arguments](#arguments-2)
    - [Returns](#returns-2)
  + [simpleDDP.call(method,arguments)](#simpleddpcallmethodarguments)
    - [Arguments](#arguments-3)
    - [Returns](#returns-3)
    - [Example](#example-1)
  + [simpleDDP.sub(subname,arguments)](#simpleddpsubsubnamearguments)
    - [Arguments](#arguments-4)
    - [Returns](#returns-4)
  + [simpleDDP.collections](#simpleddpcollections)
  + [simpleDDP.collection](#simpleddpcollection)
    - [Arguments](#arguments-5)
    - [Returns](#returns-5)
    - [Example](#example-2)    
  + [simpleDDP.stopChangeListeners()](#simpleddpstopchangelisteners)
    - [Returns](#returns-6)
    - [Example](#example-3)
  + [simpleDDP.on(event,f)](#simpleddponeventf)
    - [Arguments](#arguments-6)
      * [Connection events](#connection-events)
      * [Subscription events](#subscription-events)
      * [Method events](#method-events)
    - [Returns](#returns-7)
    - [Example](#example-4)

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

Next thing we are going to do is subscribing to some publications.

```javascript
let userSub = server.sub("user_pub");
let nextSub;
let otherSub = server.sub("other_pub",['param1',2]); // you can specify arguments for subscription in array
let userSubReadyHandler = userSub.onReady(() => {
    nextSub = server.sub("next_pub", [server.collections.users[0]._id]); //subscribing after userSub is ready using user's id as a parameter
    nextSub.onReady(() => {
        //you can draw UI here
    });
});
```

You can find all things you've subscribed for in `server.collections` property. It's a simple js object with fields named after collections. Collection itself is a plain js array which consists of mongo documents sent by server. You can use it in combination with built-in `onChange` method:

```javascript
let userSub = server.sub("user",[userId]);
userSub.onReady(() => {
    let current_user = server.collections.users.find(user=>user.id==userId);
    server.onChange(current_user, function (state) {
        console.log('previus user data',state.prev);
        console.log('next user data',state.next);
    });
});
```



## Ionic Example

Let's create a new provider in your ionic project *./src/providers/appglobals.ts*:

```typescript
import { Injectable } from '@angular/core';

import simpleDDP from 'simpleddp';

@Injectable()
export class AppGlobals {

  public server: any = new simpleDDP({
      endpoint: "ws://someserver.com/websocket",
    	SocketConstructor: WebSocket, // both modern android and ios webviews support it
      reconnectInterval: 5000,
      autoConnect: false
  });
}
```

Next we should add this provider in your *./src/app/app.module.ts*:

```typescript

...

import { AppGlobals } from '../providers/appglobals';

@NgModule({
  ...
  providers: [
    ...
    AppGlobals
  ]
})

```

Now you can use SimpleDDP from any page like this:
*./src/pages/somepage/somepage.ts*:
```typescript
import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';

import { AppGlobals } from '../../providers/appglobals';

@IonicPage()
@Component({
  selector: 'some-page',
  templateUrl: 'somepage.html',
})
export class SomePage {

  connectingMessage: any;
  postsSub: any;
  posts: array = [];
  postsChangeListener: any;

  constructor(public globals: AppGlobals, private toastCtrl: ToastController) {

    this.globals.server.connect();

    this.globals.server.on("disconnected", message => {
      //connection to server has been lost
      this.toggleConnectingMessage();
    });

    this.globals.server.on("connected", message => {
      //we have successfully connected to server
      this.toggleConnectingMessage();

      //subscribe to something
      this.postsSub = this.globals.server.sub("topTenPosts");
      this.postsSub.onReady(()=>{
        //sub is ready, from here we can access the data
        //for example we can filter the posts

        this.posts = this.globals.server.collections.posts.filter(post => post.label=="coffee");

        //be careful here, once we filtered the data
        //this.posts will be an array of links to data objects (posts)
        //so if particular posts change, this.posts will change too
        //but if there are new 'coffee' posts arrived from server this.posts won't change
        //we have to re-filter every time something is changing

        this.postsChangeListener = this.globals.server.onChange(this.globals.server.collections.posts,()=>{
          this.posts = this.globals.server.collections.posts.filter(post => post.label=="coffee");
        });

      });
    });
  }

  toggleConnectingMessage() {
    if (!this.connectingMessage) {
      this.connectingMessage = this.toastCtrl.create({
        message: 'Connecting to server...',
        position: 'bottom'
      });

      this.connectingMessage.onDidDismiss(() => {
        this.connectingMessage = false;
      });

      this.connectingMessage.present();
    } else {
      this.connectingMessage.dismiss();
    }
  }

  ionViewDidLoad() {
    //don't forget to stop everything you won't need after the page is closed
    this.postsSub.stop();
    this.globals.server.stopOnChange(this.postsChangeListener);
  }
}
```

Now we can use posts as a source of a reactive data inside the template.

*./src/pages/somepage/somepage.html*:
```html
<ion-content>
  <div *ngIf="posts.length>0">
    <ion-card *ngFor='let post of posts; trackBy: index;'>
      <ion-card-header>
        {{post.title}}
      </ion-card-header>
      <ion-card-content>
        {{post.message}}
      </ion-card-content>
    </ion-card>
  </div>
</ion-content>
```

## ReactNative Example

*Work in progress*...

## NativeScript Example

*Work in progress*...

## Tabris.js Example

*Work in progress*...

## Fusetools Example

*Work in progress*...

## API v1.1.0

### new simpleDDP(options)

Creates an instance of simpleDDP class. After being constructed, the instance will establish a connection with the DDP server and will try to maintain it open.

#### Arguments

- `options` **object** *required*

Available options are:

- `endpoint` **string** *required*: the location of the websocket server. Its format depends on the type of socket you are using. If you are using **https** connection you have to use `wss://` protocol.
- `SocketConstructor` **function** *required*: the constructor function that will be used to construct the socket. Meteor (currently the only DDP server available) supports websockets and SockJS sockets. So, practically speaking, this means that on the browser you can use either the browser's native WebSocket constructor or the SockJS constructor provided by the SockJS library. On the server you can use whichever library implements the websocket protocol (e.g. faye-websocket).
- `autoConnect` **boolean** *optional* [default: `true`]: whether to establish the connection to the server upon instantiation. When `false`, one can manually establish the connection with the `connect` method.
- `autoReconnect` **boolean** *optional* [default: `true`]: whether to try to reconnect to the server when the socket connection closes, unless the closing was initiated by a call to the `disconnect` method.
- `reconnectInterval` **number** *optional* [default: `10000`]: the interval in ms between reconnection attempts.

#### Returns

A new simpleDDP instance.

#### Example

```javascript
var opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: WebSocket,
    reconnectInterval: 5000
};
var server = new simpleDDP(opts);
```

------

### simpleDDP.connect()

Connects to the ddp server. The method is called automatically by the class constructor if the `autoConnect` option is set to `true` (default behavior). So there generally should be no need for the developer to call the method themselves.

#### Arguments

None

#### Returns

None

------

### simpleDDP.disconnect()

Disconnects from the ddp server by closing the `WebSocket` connection. You can listen on the `disconnected` event to be notified of the disconnection.

#### Arguments

None

#### Returns

None

------

### simpleDDP.call(method,arguments)

Calls a remote method.

#### Arguments

- `method` **string** *required*: name of the method to call.
- `arguments` **array** *optional*: array of parameters to pass to the remote method. Pass an empty array or don't pass anything if you do not wish to pass any parameters.

#### Returns

`Promise` object, where **then** receives a result send by server and **catch** receives an error send by server.

#### Example

```javascript
server.call("method1").then(function(result) {
	console.log(result); //show result message in console
    if (result.someId) {
        //server send us someId, lets call next method using this id
        return server.call("method2",[result.someId]);
    } else {
        //we didn't recieve an id, lets throw an error
        throw "no id sent";
    }
}).then(function(result) {
    console.log(result); //show result message from second method
}).catch(function(error) {
    console.log(result); //show error message in console
});
```

------

### simpleDDP.sub(subname,arguments)

Tries to subscribe to a specific publication on server.

#### Arguments

- `subname` **string** *required*: name of the server publication.
- `arguments` **array** *optional*: array of parameters to pass to the server publish function. Pass an empty array or don't pass anything if you do not wish to pass any parameters.

#### Returns

`ddpSubscription` object which has following methods:

- `onReady(f)`
  Runs a function after the subscription is ready and data stored in `simpleDDP.collections` can be safely used.
  - `f` **function** *required*: a function to call.
- `isReady()`: returns `true` if subscription is ready and `false` if not.
- `isOn()`: returns `true` if subscription is active and `false` if not.
- `stop()`: stops subscription.
- `start()`: starts subscription.
- `remove()`: stops and removes `ddpSubscription` object completely.

------

### simpleDDP.collections

This object always has actual state of every collection and document in each collection you have subscribed for.

------

### simpleDDP.collection

Can be used to fetch all or specific documents in the collection and observe changes.

#### Arguments

- `name` **string** *required*: collection name you want to work with

#### Returns

Returns `ddpCollection` object with listed methods:
  - `fetch()`: Returns all documents saved in the local copy of the collection. Is syntactic sugar for `simpleDDP.collections[name]`.
  - `onChange(f)`: Runs `f(msg)` every time the collection is being changed. `f(msg)` will receive as a first argument a js object `{added,removed,changed}` with listed fields:

    - `added`: A document added to the collection, `false` if none.
    - `removed`: A document removed from the collection, `false` if none.
    - `changed`: A js object with fields `prev` and `next`, where `prev` is a document before change occurred and `next` is a new document state, `false` if none.
  - `filter(f)`: Returns `ddpFilter` object with listed mothods:
    - `fetch()`: Returns all documents passing the `f(document,index,collectionArray)` predicate.
    - `onChange(f)`: Runs `f(msg)` every time the collection slice based on filter is being changed. `f(msg)` will receive as a first argument a js object `{prev,next,fields,fieldsChanged,fieldsRemoved}`, where `prev` is a document before change occurred and `next` is a new document state or `false` if document is deleted, `fields` is an associative array which contains changed fields as keys and `0` or `1` as values (`0` if the field was removed, `1` if the field was changed), `fieldsChanged` is an object with EJSON values, `fieldsRemoved` is an array of strings (field names to delete). Returns `ddpOnChange` object.

  Returns `ddpOnChange` object with listed methods:
    - `stop()`: Stops observing the changes.
    - `start()`: Starts observing the changes if was previously stopped. `ddpOnChange` starts upon the creation by default.

#### Example

```javascript
let userSub = server.sub('user',[id]);

let collectionObserver = server.collection('foe').onChange(function ({added,removed,changed}) {
  //observing changes in the collection
});

collectionObserver.stop(); //stops observing

let collectionDocumentObserver = server.collection('foe').filter(e=>e.id==id).onChange(function ({prev,next}) {
  //observing changes in the specific document in the collection
  if (next) {
      // we have changed user document here as next
      // we can redraw some UI
  } else {
      // we can logout here for example
  }
});

let collectionDocumentFieldsObserver = server.collection('foe').filter(e=>e.id==id).onChange(function ({prev,next,fields}) {
  //observing changes in the specific document's fields in the collection
  if ('name' in fields) {
    // code here
  }
});

userSub.onReady(()=>{
    let collectionSlice = server.collection('foe').filter(e=>e.id==id).fetch(); // will return an array of documents matching the filter function
});
```

------

### simpleDDP.stopChangeListeners()

Stops listening for changes for every active `ddpOnChange` object.

#### Returns

None

#### Example

```javascript
let listener1 = server.collection('foe').onChange(someFunc1); //some listener
let listener2 = server.collection('abc').onChange(someFunc2); //some listener
let listener3 = server.collection('xyz').onChange(someFunc3); //some listener

//somewhere later in the code
server.stopChangeListeners();
```

------

### simpleDDP.on(event,f)

Starts listening server for basic DDP `event` running `f` each time the message arrives.

#### Arguments

- `event` **string** *required*: any event name from DDP specification

  ##### Connection events

  - `connected`: emitted with no arguments when the DDP connection is established.
  - `disconnected`: emitted with no arguments when the DDP connection drops.

  ##### Subscription events

  All the following events are emitted with one argument, the parsed DDP message. Further details can be found [on the DDP spec page](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md).

  - `ready`
  - `nosub`
  - `added`
  - `changed`
  - `removed`

  ##### Method events

  All the following events are emitted with one argument, the parsed DDP message. Further details can be found [on the DDP spec page](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md).

  - `result`
  - `updated`

- `f` **function** *required*: a function which receives a message from a DDP server as a first argument each time server is invoking `event`.

#### Returns

`ddpEventListener` object which has following methods:

- `start()`: Usually you won't need this unless you stopped the `ddpEventListener`. `ddpEventListener` starts on creation.
- `stop()`: Stops listening for server `event` messages. You can start any stopped `ddpEventListener` at any time using `ddpEventListener.start()`.

#### Example

```javascript
server.on('connected', () => {
    // you can show a success message here
});

server.on('disconnected', () => {
    // you can show a reconnection message here
});
```
