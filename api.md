<a name="simpleDDP"></a>

## simpleDDP
Creates an instance of simpleDDP class. After being constructed, the instance will
establish a connection with the DDP server and will try to maintain it open.

**Kind**: global class  
**Version**: 2.1.0  

* [simpleDDP](#simpleDDP)
    * [new simpleDDP(options, [plugins])](#new_simpleDDP_new)
    * [.collection(name)](#simpleDDP+collection) ⇒ [<code>ddpCollection</code>](#ddpCollection)
    * [.connect()](#simpleDDP+connect) ⇒ <code>Promise</code>
    * [.disconnect()](#simpleDDP+disconnect) ⇒ <code>Promise</code>
    * [.apply(method, [arguments], [atBeginning])](#simpleDDP+apply) ⇒ <code>Promise</code>
    * [.call(method, [...args])](#simpleDDP+call) ⇒ <code>Promise</code>
    * [.sub(pubname, [arguments])](#simpleDDP+sub) ⇒ [<code>ddpSubscription</code>](#ddpSubscription)
    * [.subscribe(pubname, [...args])](#simpleDDP+subscribe) ⇒ [<code>ddpSubscription</code>](#ddpSubscription)
    * [.on(event, f)](#simpleDDP+on) ⇒ [<code>ddpEventListener</code>](#ddpEventListener)
    * [.stopChangeListeners()](#simpleDDP+stopChangeListeners)
    * [.clearData()](#simpleDDP+clearData) ⇒ <code>Promise</code>
    * [.importData(data)](#simpleDDP+importData) ⇒ <code>Promise</code>
    * [.exportData([format])](#simpleDDP+exportData) ⇒ <code>Object</code> \| <code>string</code>
    * [.markAsReady(subs)](#simpleDDP+markAsReady) ⇒ <code>Promise</code>

<a name="new_simpleDDP_new"></a>

### new simpleDDP(options, [plugins])
**Returns**: [<code>simpleDDP</code>](#simpleDDP) - - A new simpleDDP instance.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | Instance of @see ddpReactiveCollection class. |
| options.endpoint | <code>string</code> |  | the location of the websocket server. Its format depends on the type of socket you are using. If you are using https connection you have to use wss:// protocol. |
| options.SocketConstructor | <code>function</code> |  | the constructor function that will be used to construct the socket. Meteor (currently the only DDP server available) supports websockets and SockJS sockets. So, practically speaking, this means that on the browser you can use either the browser's native WebSocket constructor or the SockJS constructor provided by the SockJS library. On the server you can use whichever library implements the websocket protocol (e.g. faye-websocket). |
| [options.autoConnect] | <code>boolean</code> | <code>true</code> | whether to establish the connection to the server upon instantiation. When false, one can manually establish the connection with the connect method. |
| [options.autoReconnect] | <code>boolean</code> | <code>true</code> | whether to try to reconnect to the server when the socket connection closes, unless the closing was initiated by a call to the disconnect method. |
| [options.reconnectInterval] | <code>number</code> | <code>1000</code> | the interval in ms between reconnection attempts. |
| [options.maxTimeout] | <code>number</code> |  | maximum wait for a response from the server to the method call. Default no maxTimeout. |
| [plugins] | <code>Array</code> |  | Function for a reduction. |

**Example**  
```js
var opts = {
   endpoint: "ws://someserver.com/websocket",
   SocketConstructor: WebSocket,
   reconnectInterval: 5000
};
var server = new simpleDDP(opts);
```
<a name="simpleDDP+collection"></a>

### simpleDDP.collection(name) ⇒ [<code>ddpCollection</code>](#ddpCollection)
Use this for fetching the subscribed data and for reactivity inside the collection.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Collection name. |

<a name="simpleDDP+connect"></a>

### simpleDDP.connect() ⇒ <code>Promise</code>
Connects to the ddp server. The method is called automatically by the class constructor if the autoConnect option is set to true (default behavior).

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: <code>Promise</code> - - Promise which resolves when connection is established.  
**Access**: public  
<a name="simpleDDP+disconnect"></a>

### simpleDDP.disconnect() ⇒ <code>Promise</code>
Disconnects from the ddp server by closing the WebSocket connection. You can listen on the disconnected event to be notified of the disconnection.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: <code>Promise</code> - - Promise which resolves when connection is closed.  
**Access**: public  
<a name="simpleDDP+apply"></a>

### simpleDDP.apply(method, [arguments], [atBeginning]) ⇒ <code>Promise</code>
Calls a remote method with arguments passed in array.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: <code>Promise</code> - - Promise object, which resolves when receives a result send by server and rejects when receives an error send by server.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| method | <code>string</code> |  | name of the server publication. |
| [arguments] | <code>Array</code> |  | array of parameters to pass to the remote method. Pass an empty array or don't pass anything if you do not wish to pass any parameters. |
| [atBeginning] | <code>boolean</code> | <code>false</code> | if true puts method call at the beginning of the requests queue. |

**Example**  
```js
server.apply("method1").then(function(result) {
	console.log(result); //show result message in console
   if (result.someId) {
       //server sends us someId, lets call next method using this id
       return server.apply("method2",[result.someId]);
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
<a name="simpleDDP+call"></a>

### simpleDDP.call(method, [...args]) ⇒ <code>Promise</code>
Calls a remote method with arguments passed after the first argument.
Syntactic sugar for @see apply.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: <code>Promise</code> - - Promise object, which resolves when receives a result send by server and rejects when receives an error send by server.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | name of the server publication. |
| [...args] | <code>object</code> | list of parameters to pass to the remote method. Parameters are passed as function arguments. |

<a name="simpleDDP+sub"></a>

### simpleDDP.sub(pubname, [arguments]) ⇒ [<code>ddpSubscription</code>](#ddpSubscription)
Tries to subscribe to a specific publication on server.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: [<code>ddpSubscription</code>](#ddpSubscription) - - Subscription.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| pubname | <code>string</code> | name of the publication on server. |
| [arguments] | <code>Array</code> | array of parameters to pass to the remote method. Pass an empty array or don't pass anything if you do not wish to pass any parameters. |

<a name="simpleDDP+subscribe"></a>

### simpleDDP.subscribe(pubname, [...args]) ⇒ [<code>ddpSubscription</code>](#ddpSubscription)
Tries to subscribe to a specific publication on server.
Syntactic sugar for @see sub.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: [<code>ddpSubscription</code>](#ddpSubscription) - - Subscription.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| pubname | <code>string</code> | name of the publication on server. |
| [...args] | <code>object</code> | list of parameters to pass to the remote method. Parameters are passed as function arguments. |

<a name="simpleDDP+on"></a>

### simpleDDP.on(event, f) ⇒ [<code>ddpEventListener</code>](#ddpEventListener)
Starts listening server for basic DDP event running f each time the message arrives.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | any event name from DDP specification |
| f | <code>function</code> | a function which receives a message from a DDP server as a first argument each time server is invoking event. |

**Example**  
```js
server.on('connected', () => {
    // you can show a success message here
});

server.on('disconnected', () => {
    // you can show a reconnection message here
});
```
<a name="simpleDDP+stopChangeListeners"></a>

### simpleDDP.stopChangeListeners()
Stops all reactivity.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
<a name="simpleDDP+clearData"></a>

### simpleDDP.clearData() ⇒ <code>Promise</code>
Removes all documents like if it was removed by the server publication.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: <code>Promise</code> - - Resolves when data is successfully removed.  
**Access**: public  
<a name="simpleDDP+importData"></a>

### simpleDDP.importData(data) ⇒ <code>Promise</code>
Imports the data like if it was published by the server.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: <code>Promise</code> - - Resolves when data is successfully imported.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> \| <code>string</code> | ESJON string or EJSON. |

<a name="simpleDDP+exportData"></a>

### simpleDDP.exportData([format]) ⇒ <code>Object</code> \| <code>string</code>
Exports the data

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: <code>Object</code> \| <code>string</code> - - EJSON string or EJSON.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [format] | <code>string</code> | <code>&quot;&#x27;string&#x27;&quot;</code> | Possible values are 'string' (EJSON string) and 'raw' (EJSON). |

<a name="simpleDDP+markAsReady"></a>

### simpleDDP.markAsReady(subs) ⇒ <code>Promise</code>
Marks every passed @see ddpSubscription object as ready like if it was done by the server publication.

**Kind**: instance method of [<code>simpleDDP</code>](#simpleDDP)  
**Returns**: <code>Promise</code> - - Resolves when all passed subscriptions are marked as ready.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| subs | <code>Array</code> | Array of @see ddpSubscription objects. |

