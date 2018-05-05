# SimpleDDP

The aim of this library is to simplify the process of working with meteor server over DDP protocol using external JS environments (like Cordova, Ionic, ReactNative, other web frontend etc).

The library is build on top of ddp.js.

[TOC]

## Important

SimpleDDP is written in ES6 and uses modern features like *promises*. Though its precompiled with Babel, your js enviroment must support ES6 features. So if you are planning to use SimpleDDP be sure that your js enviroment supports ES6 features or include pollyfils yourself (like Babel Pollyfil).

## Install

`npm install simpleddp --save`

## Usage

First of all you should make a new simpleDDP instance.

```javascript
var opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: WebSocket,
    reconnectInterval: 5000
};
var server = new simpleDDP(opts);
```

Connection is not going to be established immideatly after you create a simpleDDP instance. If you need to check your connection simply use `server.connected` property which is `true` if you are connected to the server, otherwise it's `false`.

You can also add some events for connection status.

```javascript
server.on('connected', () => {
    // do somethong
});

server.on('disconnected', () => {
    // for example show alert to user
});
```

Next thing we are going to do is subscribing to some pulications.

```javascript
var userSub = server.sub("user_pub");
var nextSub;
var otherSub = server.sub("other_pub",['param1',2]); // you can specify arguments for subscription in array
var userSubReadyHandler = userSub.onReady(() => {
    nextSub = server.sub("next_pub", [server.collections.users[0]._id]); //subscribing after userSub is ready using user's id as a parameter
    nextSub.onReady(() => {
        //you can draw UI here
    });
});
```

You can find all things you've subscribed for in `server.collections` property. It's a simple js object with fields named after collections. Collection itself is a plain js array which consists of mongo documents sent by server. You can use it in combination with built-in `onChange` method:

```javascript
var userSub = server.sub("user",[userId]);
userSub.onReady(() => {
    var current_user = server.collections.users.find(user=>user.id==userId);
    server.onChange(current_user, function (state) {
        console.log('previus user data',state.prev);
        console.log('next user data',state.next);
    });
});
```



## Ionic Example

*Work in progress*...

## ReactNative Example

*Work in progress*...

## NativeScript Example

*Work in progress*...

## Tabris.js Example

*Work in progress*...

## Fusetools Example

*Work in progress*...

## API v1.0.15

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
- `idPrefix` **string** *optional* [default: `"_id"`]: unique document identifier. If you use something else rather than MongoDB you can specify here the field name of your unique document identifier.

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

Connects to the ddp server. The method is called automatically by the class constructor if the `autoConnect` option is set to `true` (default behaviour). So there generally should be no need for the developer to call the method themselves.

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

`Promise` object, where **then** recieves a result send by server and **catch** recieves an error send by server.

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

- `onReady(f,once)`
  Runs a function after the subscription is ready and data stored in `simpleDDP.collections` can be safely used.
  - `f` **function** *required*: a function to call.
  - `once` **boolean** *optional* [default: `false`]: f `true`, `f` will be fired only the first time server sends a ready reponse.
- `isReady()`: returns `true` if subscription is ready and `false` if not.
- `isOn()`: returns `true` if subscription is active and `false` if not.
- `stop()`: stops subscription.
- `start()`: starts subscription.
- `remove()`: stops and removes `ddpSubscription` object completly.

------

### simpleDDP.collections

This object always has actual state of every collection and document in each collection you have subscribed for.

------

### simpleDDP.onChange(obj,f)

Creates a listener for changes in built-in collections object.

#### Arguments

- `obj` **object** *required*: object to listen changes for. Should be a part of `simpleDDP.collections`. You can listen for changes in a specific collection or in a specific document.

- `f` **function** *required*: a function that will iterate each time a change occures in `obj`. 
  If `obj` is a collection `f(msg)` will recieve as a first argument a js object `{added,removed,changed}` with listed fields:

  - `added`: a document added to the collection.
  - `removed`: a document removed from the collection.
  - `changed`: a js object with fields `prev` and `next`, where `prev` is a document before change accured and `next` is a new document state.

  If `obj` is a document `f(msg)` will recieve as a first argument a js object `{prev,next}`, where `prev` is a document before change accured and `next` is a new document state or `false` if document is deleted.

#### Returns

An object which can be used to stop `onChange` listener later.

#### Example

```javascript
let userSub = server.sub('user',[id]);
userSub.onReady(()=>{
    server.onChange(server.collections.users.find(user=>user.id==id),({prev,next})=>{
        if (next) {
            // we have changed user document here as next
            // we can redraw some UI
        } else {
            // we can logout here for example
        }
    });
});
```

------

### simpleDDP.stopOnChange(listener)

Stops listening changes described in `listener`.

#### Arguments

- `listener` **object** *required*: previously created listener in `onChange` method.

#### Returns

None

#### Example

```javascript
let listener1 = server.onChange(someOjb,someFunc); //some listener

//somewhere later in the code
server.stopOnChange(listener1);
```