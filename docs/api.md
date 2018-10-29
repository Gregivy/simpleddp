# SimpleDDP API v1.1.7

## Contents

+ [new simpleDDP(options,plugins)](#new-simpleddpoptionsplugins)
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
+ [simpleDDP.collection(name)](#simpleddpcollectionname)
  - [Arguments](#arguments-5)
  - [Returns](#returns-5)
  - [Example](#example-2)    
+ [simpleDDP.stopChangeListeners()](#simpleddpstopchangelisteners)
  - [Returns](#returns-6)
  - [Example](#example-3)
+ [simpleDDP.on(event,f)](#simpleddponeventf)
  - [Arguments](#arguments-6)
  - [Returns](#returns-7)
  - [Example](#example-4)

## new simpleDDP(options,plugins)

Creates an instance of simpleDDP class. After being constructed, the instance will establish a connection with the DDP server and will try to maintain it open.

### Arguments

- `options` **object** *required*
- `plugins` **array** *optional*

Available options are:

- `endpoint` **string** *required*: the location of the websocket server. Its format depends on the type of socket you are using. If you are using **https** connection you have to use `wss://` protocol.
- `SocketConstructor` **function** *required*: the constructor function that will be used to construct the socket. Meteor (currently the only DDP server available) supports websockets and SockJS sockets. So, practically speaking, this means that on the browser you can use either the browser's native WebSocket constructor or the SockJS constructor provided by the SockJS library. On the server you can use whichever library implements the websocket protocol (e.g. faye-websocket).
- `autoConnect` **boolean** *optional* [default: `true`]: whether to establish the connection to the server upon instantiation. When `false`, one can manually establish the connection with the `connect` method.
- `autoReconnect` **boolean** *optional* [default: `true`]: whether to try to reconnect to the server when the socket connection closes, unless the closing was initiated by a call to the `disconnect` method.
- `reconnectInterval` **number** *optional* [default: `10000`]: the interval in ms between reconnection attempts.

### Returns

A new simpleDDP instance.

### Example

```javascript
var opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: WebSocket,
    reconnectInterval: 5000
};
var server = new simpleDDP(opts);
```

------

## simpleDDP.connect()

Connects to the ddp server. The method is called automatically by the class constructor if the `autoConnect` option is set to `true` (default behavior).

### Arguments

None

### Returns

*Promise* which resolves when connection is established.

------

## simpleDDP.disconnect()

Disconnects from the ddp server by closing the `WebSocket` connection. You can listen on the `disconnected` event to be notified of the disconnection.

### Arguments

None

### Returns

*Promise* which resolves when connection is closed.

------

## simpleDDP.call(method,arguments)

Calls a remote method.

### Arguments

- `method` **string** *required*: name of the method to call.
- `arguments` **array** *optional*: array of parameters to pass to the remote method. Pass an empty array or don't pass anything if you do not wish to pass any parameters.

### Returns

`Promise` object, where **then** receives a result send by server and **catch** receives an error send by server.

### Example

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

## simpleDDP.sub(subname,arguments)

Tries to subscribe to a specific publication on server.

### Arguments

- `subname` **string** *required*: name of the server publication.
- `arguments` **array** *optional*: array of parameters to pass to the server publish function. Pass an empty array or don't pass anything if you do not wish to pass any parameters.

### Returns

`ddpSubscription` object which has following methods:

- `onReady(f)`
  Runs a function after the subscription is ready and data stored in `simpleDDP.collections` can be safely used.
  - `f` **function** *required*: a function to call.
- `ready()`: returns *Promise* which resolves when subscription is ready.
- `isReady()`: returns `true` if subscription is ready and `false` if not.
- `isOn()`: returns `true` if subscription is active and `false` if not.
- `stop()`: stops subscription.
- `start()`: starts subscription.
- `remove()`: stops and removes `ddpSubscription` object completely.

------

## simpleDDP.collections

This object always has actual state of every collection and document in each collection you have subscribed for.

------

## simpleDDP.collection(name)

Can be used to fetch all or specific documents in the collection and observe changes.

### Arguments

- `name` **string** *required*: collection name you want to work with

### Returns

Returns `ddpCollection` object with listed methods:
  - `fetch()`: Returns **array** of all documents saved in the local copy of the collection. Is syntactic sugar for `simpleDDP.collections[name]`.
  - `onChange(f)`: Returns `ddpOnChange` object. Runs `f(msg)` every time the collection is being changed. `f(msg)` will receive as a first argument a js object `{added,removed,changed}` with listed fields:

    - `added`: A document added to the collection, `false` if none.
    - `removed`: A document removed from the collection, `false` if none.
    - `changed`: A js object `{prev,next,fields,fieldsChanged,fieldsRemoved}`, where `prev` is a document before change occurred (or `false` if document was added) and `next` is a new document state (or `false` if document was deleted), `fields` is an associative array which contains changed fields as keys and `0` or `1` as values (`0` if the field was removed, `1` if the field was changed), `fieldsChanged` is an object with EJSON values, `fieldsRemoved` is an array of strings (field names to delete).
  - `filter(f)`: Returns `ddpFilter` object with listed methods:
    - `fetch()`: Returns **array** of all documents passing the `f(document,index,collectionArray)` predicate.
    - `onChange(f)`: Runs `f(msg)` every time the collection slice based on filter is being changed. `f(msg)` will receive as a first argument a js object `{prev,next,fields,fieldsChanged,fieldsRemoved}`, where `prev` is a document before change occurred (or `false` if document was added) and `next` is a new document state (or `false` if document was deleted), `fields` is an associative array which contains changed fields as keys and `0` or `1` as values (`0` if the field was removed, `1` if the field was changed), `fieldsChanged` is an object with EJSON values, `fieldsRemoved` is an array of strings (field names to delete). Returns `ddpOnChange` object.

`ddpOnChange` object methods:
  - `stop()`: Stops observing the changes.
  - `start()`: Starts observing the changes if was previously stopped. `ddpOnChange` starts upon the creation by default.

### Example

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

## simpleDDP.stopChangeListeners()

Stops listening for changes for every active `ddpOnChange` object.

### Returns

None

### Example

```javascript
let listener1 = server.collection('foe').onChange(someFunc1); //some listener
let listener2 = server.collection('abc').onChange(someFunc2); //some listener
let listener3 = server.collection('xyz').onChange(someFunc3); //some listener

//somewhere later in the code
server.stopChangeListeners();
```

------

## simpleDDP.on(event,f)

Starts listening server for basic DDP `event` running `f` each time the message arrives.

### Arguments

- `event` **string** *required*: any event name from DDP specification

  **Connection events**

  - `connected`: emitted with no arguments when the DDP connection is established.
  - `disconnected`: emitted with no arguments when the DDP connection drops.

  **Subscription events**

  All the following events are emitted with one argument, the parsed DDP message. Further details can be found [on the DDP spec page](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md).

  - `ready`
  - `nosub`
  - `added`
  - `changed`
  - `removed`

  **Method events**

  All the following events are emitted with one argument, the parsed DDP message. Further details can be found [on the DDP spec page](https://github.com/meteor/meteor/blob/devel/packages/ddp/DDP.md).

  - `result`
  - `updated`

- `f` **function** *required*: a function which receives a message from a DDP server as a first argument each time server is invoking `event`.

### Returns

`ddpEventListener` object which has following methods:

- `start()`: Usually you won't need this unless you stopped the `ddpEventListener`. `ddpEventListener` starts on creation.
- `stop()`: Stops listening for server `event` messages. You can start any stopped `ddpEventListener` at any time using `ddpEventListener.start()`.

### Example

```javascript
server.on('connected', () => {
    // you can show a success message here
});

server.on('disconnected', () => {
    // you can show a reconnection message here
});
```
