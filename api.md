## Classes

<dl>
<dt><a href="#simpleDDP">simpleDDP</a></dt>
<dd><p>Creates an instance of simpleDDP class. After being constructed, the instance will
establish a connection with the DDP server and will try to maintain it open.</p>
</dd>
<dt><a href="#ddpCollection">ddpCollection</a></dt>
<dd><p>DDP collection class.</p>
</dd>
<dt><a href="#ddpEventListener">ddpEventListener</a></dt>
<dd><p>DDP event listener class.</p>
</dd>
<dt><a href="#ddpOnChange">ddpOnChange</a></dt>
<dd><p>DDP change listener class.</p>
</dd>
<dt><a href="#ddpReactiveCollection">ddpReactiveCollection</a></dt>
<dd><p>A reactive collection class.</p>
</dd>
<dt><a href="#ddpReactiveDocument">ddpReactiveDocument</a></dt>
<dd><p>A reactive document class.</p>
</dd>
<dt><a href="#ddpReducer">ddpReducer</a></dt>
<dd><p>A reducer class for a reactive document.</p>
</dd>
<dt><a href="#ddpSubscription">ddpSubscription</a></dt>
<dd><p>DDP subscription class.</p>
</dd>
</dl>

<a name="simpleDDP"></a>

## simpleDDP
Creates an instance of simpleDDP class. After being constructed, the instance will
establish a connection with the DDP server and will try to maintain it open.

**Kind**: global class  
**Version**: 2.0.1  

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

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | Instance of @see ddpReactiveCollection class. |
| options.endpoint | <code>string</code> |  | the location of the websocket server. Its format depends on the type of socket you are using. If you are using https connection you have to use wss:// protocol. |
| options.SocketConstructor | <code>function</code> |  | the constructor function that will be used to construct the socket. Meteor (currently the only DDP server available) supports websockets and SockJS sockets. So, practically speaking, this means that on the browser you can use either the browser's native WebSocket constructor or the SockJS constructor provided by the SockJS library. On the server you can use whichever library implements the websocket protocol (e.g. faye-websocket). |
| [options.autoConnect] | <code>boolean</code> | <code>true</code> | whether to establish the connection to the server upon instantiation. When false, one can manually establish the connection with the connect method. |
| [options.autoReconnect] | <code>boolean</code> | <code>true</code> | whether to try to reconnect to the server when the socket connection closes, unless the closing was initiated by a call to the disconnect method. |
| [options.reconnectInterval] | <code>number</code> | <code>1000</code> | the interval in ms between reconnection attempts. |
| [plugins] | <code>Array</code> |  | Function for a reduction. |

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

<a name="ddpCollection"></a>

## ddpCollection
DDP collection class.

**Kind**: global class  

* [ddpCollection](#ddpCollection)
    * [new exports.ddpCollection(name, server)](#new_ddpCollection_new)
    * [.filter(f)](#ddpCollection+filter) ⇒ <code>this</code>
    * [.importData(data)](#ddpCollection+importData)
    * [.exportData([format])](#ddpCollection+exportData) ⇒ <code>string</code> \| <code>Object</code>
    * [.fetch([settings])](#ddpCollection+fetch) ⇒ <code>Object</code>
    * [.reactive([settings])](#ddpCollection+reactive) ⇒ <code>Object</code>
    * [.onChange(f, filter)](#ddpCollection+onChange) ⇒ <code>Object</code>

<a name="new_ddpCollection_new"></a>

### new exports.ddpCollection(name, server)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Collection name. |
| server | [<code>simpleDDP</code>](#simpleDDP) | simpleDDP instance. |

<a name="ddpCollection+filter"></a>

### ddpCollection.filter(f) ⇒ <code>this</code>
Allows to specify specific documents inside the collection for reactive data and fetching.

**Kind**: instance method of [<code>ddpCollection</code>](#ddpCollection)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Filter function, recieves as arguments object, index and array. |

<a name="ddpCollection+importData"></a>

### ddpCollection.importData(data)
Imports data inside the collection and emits all relevant events.
Both string and JS object types are supported.

**Kind**: instance method of [<code>ddpCollection</code>](#ddpCollection)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> \| <code>Object</code> | EJSON string or EJSON or js object. |

<a name="ddpCollection+exportData"></a>

### ddpCollection.exportData([format]) ⇒ <code>string</code> \| <code>Object</code>
Exports data from the collection.

**Kind**: instance method of [<code>ddpCollection</code>](#ddpCollection)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [format] | <code>string</code> | <code>&quot;&#x27;string&#x27;&quot;</code> | If 'string' then returns EJSON string, if 'raw' returns js object. |

<a name="ddpCollection+fetch"></a>

### ddpCollection.fetch([settings]) ⇒ <code>Object</code>
Returns collection data based on filter and on passed settings. Supports skip, limit and sort.
Order is 'filter' then 'sort' then 'skip' then 'limit'.

**Kind**: instance method of [<code>ddpCollection</code>](#ddpCollection)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [settings] | <code>Object</code> | <code>{skip:0,limit:Infinity,sort:null}</code> | skip and limit are numbers or Infinity, sort is a standard js array sort function. |

<a name="ddpCollection+reactive"></a>

### ddpCollection.reactive([settings]) ⇒ <code>Object</code>
Returns reactive collection object.

**Kind**: instance method of [<code>ddpCollection</code>](#ddpCollection)  
**Returns**: <code>Object</code> - - @see ddpReactiveCollection  
**Access**: public  
**See**: ddpReactiveCollection  

| Param | Type | Default |
| --- | --- | --- |
| [settings] | <code>Object</code> | <code>{skip:0,limit:Infinity,sort:null}</code> |

<a name="ddpCollection+onChange"></a>

### ddpCollection.onChange(f, filter) ⇒ <code>Object</code>
Returns change observer.

**Kind**: instance method of [<code>ddpCollection</code>](#ddpCollection)  
**Returns**: <code>Object</code> - - @see ddpOnChange  
**Access**: public  
**See**: ddpOnChange  

| Param | Type |
| --- | --- |
| f | <code>function</code> |
| filter | <code>function</code> |

<a name="ddpEventListener"></a>

## ddpEventListener
DDP event listener class.

**Kind**: global class  

* [ddpEventListener](#ddpEventListener)
    * [new exports.ddpEventListener(eventname, f, ddplink)](#new_ddpEventListener_new)
    * [.stop()](#ddpEventListener+stop)
    * [.start()](#ddpEventListener+start)

<a name="new_ddpEventListener_new"></a>

### new exports.ddpEventListener(eventname, f, ddplink)

| Param | Type | Description |
| --- | --- | --- |
| eventname | <code>String</code> | Event name. |
| f | <code>function</code> | Function to run when event is fired. |
| ddplink | [<code>simpleDDP</code>](#simpleDDP) | simpleDDP instance. |

<a name="ddpEventListener+stop"></a>

### ddpEventListener.stop()
Stops listening for server `event` messages.
You can start any stopped @see ddpEventListener at any time using `ddpEventListener.start()`.

**Kind**: instance method of [<code>ddpEventListener</code>](#ddpEventListener)  
**Access**: public  
<a name="ddpEventListener+start"></a>

### ddpEventListener.start()
Usually you won't need this unless you stopped the @see ddpEventListener.

**Kind**: instance method of [<code>ddpEventListener</code>](#ddpEventListener)  
**Access**: public  
**See**: ddpEventListener starts on creation.  
<a name="ddpOnChange"></a>

## ddpOnChange
DDP change listener class.

**Kind**: global class  

* [ddpOnChange](#ddpOnChange)
    * [new exports.ddpOnChange(obj, inst, [listenersArray])](#new_ddpOnChange_new)
    * [.stop()](#ddpOnChange+stop)
    * [.start()](#ddpOnChange+start)

<a name="new_ddpOnChange_new"></a>

### new exports.ddpOnChange(obj, inst, [listenersArray])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| obj | <code>Object</code> |  | Describes changes of interest. |
| inst | <code>\*</code> |  | event handler instance. |
| [listenersArray] | [<code>simpleDDP</code>](#simpleDDP) | <code>&#x27;onChangeFuncs&#x27;</code> | property name of event handler instance, array of listeners. |

<a name="ddpOnChange+stop"></a>

### ddpOnChange.stop()
Stops change listener.

**Kind**: instance method of [<code>ddpOnChange</code>](#ddpOnChange)  
**Access**: public  
<a name="ddpOnChange+start"></a>

### ddpOnChange.start()
Start change listener. This method is being called on instance creation.

**Kind**: instance method of [<code>ddpOnChange</code>](#ddpOnChange)  
**Access**: public  
<a name="ddpReactiveCollection"></a>

## ddpReactiveCollection
A reactive collection class.

**Kind**: global class  

* [ddpReactiveCollection](#ddpReactiveCollection)
    * [new exports.ddpReactiveCollection(ddpCollection, [skiplimit])](#new_ddpReactiveCollection_new)
    * [._updateReactiveObjects()](#ddpReactiveCollection+_updateReactiveObjects)
    * [.settings([skiplimit])](#ddpReactiveCollection+settings)
    * [.stop()](#ddpReactiveCollection+stop)
    * [.start()](#ddpReactiveCollection+start)
    * [.sort(f)](#ddpReactiveCollection+sort) ⇒ <code>this</code>
    * [.data()](#ddpReactiveCollection+data) ⇒ <code>Array</code>
    * [.onChange(f)](#ddpReactiveCollection+onChange)
    * [.map(f)](#ddpReactiveCollection+map) ⇒ [<code>ddpReducer</code>](#ddpReducer)
    * [.reduce(f, initialValue)](#ddpReactiveCollection+reduce) ⇒ [<code>ddpReducer</code>](#ddpReducer)
    * [.count()](#ddpReactiveCollection+count) ⇒ <code>Object</code>
    * [.one([settings])](#ddpReactiveCollection+one) ⇒ [<code>ddpReactiveDocument</code>](#ddpReactiveDocument)

<a name="new_ddpReactiveCollection_new"></a>

### new exports.ddpReactiveCollection(ddpCollection, [skiplimit])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| ddpCollection | [<code>ddpCollection</code>](#ddpCollection) |  | Instance of @see ddpCollection class. |
| [skiplimit] | <code>Object</code> | <code>{skip:0,limit:Infinity}</code> | Object for declarative reactive collection slicing. |

<a name="ddpReactiveCollection+_updateReactiveObjects"></a>

### ddpReactiveCollection.\_updateReactiveObjects()
Sends new object state for every associated reactive object.

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Access**: public  
<a name="ddpReactiveCollection+settings"></a>

### ddpReactiveCollection.settings([skiplimit])
Update ddpReactiveCollection settings.

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [skiplimit] | <code>Object</code> | <code>{skip:0,limit:Infinity}</code> | Object for declarative reactive collection slicing. |

<a name="ddpReactiveCollection+stop"></a>

### ddpReactiveCollection.stop()
Stops reactivity. Also stops associated reactive objects.

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Access**: public  
<a name="ddpReactiveCollection+start"></a>

### ddpReactiveCollection.start()
Start reactivity. This method is being called on instance creation.
Also starts every associated reactive object.

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Access**: public  
<a name="ddpReactiveCollection+sort"></a>

### ddpReactiveCollection.sort(f) ⇒ <code>this</code>
Sorts local collection according to specified function.
Specified function form [https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | A function used for sorting. |

<a name="ddpReactiveCollection+data"></a>

### ddpReactiveCollection.data() ⇒ <code>Array</code>
Returns reactive local collection with applied sorting, skip and limit.
This returned array is being mutated within this class instance.

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Returns**: <code>Array</code> - - Local collection with applied sorting, skip and limit.  
**Access**: public  
<a name="ddpReactiveCollection+onChange"></a>

### ddpReactiveCollection.onChange(f)
Runs a function every time a change occurs.

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function which recieves new collection at each change. |

<a name="ddpReactiveCollection+map"></a>

### ddpReactiveCollection.map(f) ⇒ [<code>ddpReducer</code>](#ddpReducer)
Maps reactive local collection to another reactive array.
Specified function form [https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Returns**: [<code>ddpReducer</code>](#ddpReducer) - - Object that allows to get reactive mapped data @see ddpReducer.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function that produces an element of the new Array. |

<a name="ddpReactiveCollection+reduce"></a>

### ddpReactiveCollection.reduce(f, initialValue) ⇒ [<code>ddpReducer</code>](#ddpReducer)
Reduces reactive local collection.
Specified function form [https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce).

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Returns**: [<code>ddpReducer</code>](#ddpReducer) - - Object that allows to get reactive object based on reduced reactive local collection @see ddpReducer.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function to execute on each element in the array. |
| initialValue | <code>\*</code> | Value to use as the first argument to the first call of the function. |

<a name="ddpReactiveCollection+count"></a>

### ddpReactiveCollection.count() ⇒ <code>Object</code>
Reactive length of the local collection.

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Returns**: <code>Object</code> - - Object with reactive length of the local collection. {result}  
**Access**: public  
<a name="ddpReactiveCollection+one"></a>

### ddpReactiveCollection.one([settings]) ⇒ [<code>ddpReactiveDocument</code>](#ddpReactiveDocument)
Returns a reactive object which fields are always the same as the first object in the collection.

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Returns**: [<code>ddpReactiveDocument</code>](#ddpReactiveDocument) - - Object that allows to get reactive object based on reduced reactive local collection @see ddpReactiveDocument.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [settings] | <code>Object</code> | <code>{preserve:false}</code> | Settings for reactive object. Use {preserve:true} if you want to keep object on remove. |

<a name="ddpReactiveDocument"></a>

## ddpReactiveDocument
A reactive document class.

**Kind**: global class  

* [ddpReactiveDocument](#ddpReactiveDocument)
    * [new exports.ddpReactiveDocument(ddpReactiveCollectionInstance, [settings])](#new_ddpReactiveDocument_new)
    * [.start()](#ddpReactiveDocument+start)
    * [.stop()](#ddpReactiveDocument+stop)
    * [.data()](#ddpReactiveDocument+data) ⇒ <code>Object</code>
    * [.onChange(f)](#ddpReactiveDocument+onChange)
    * [.settings(settings)](#ddpReactiveDocument+settings)

<a name="new_ddpReactiveDocument_new"></a>

### new exports.ddpReactiveDocument(ddpReactiveCollectionInstance, [settings])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| ddpReactiveCollectionInstance | [<code>ddpReactiveCollection</code>](#ddpReactiveCollection) |  | Instance of @see ddpReactiveCollection class. |
| [settings] | <code>Object</code> | <code>{preserve:false}</code> | Settings for reactive object. When preserve is true, reactive object won't change when corresponding object is being deleted. |

<a name="ddpReactiveDocument+start"></a>

### ddpReactiveDocument.start()
Starts reactiveness for the document. This method is being called on instance creation.

**Kind**: instance method of [<code>ddpReactiveDocument</code>](#ddpReactiveDocument)  
**Access**: public  
<a name="ddpReactiveDocument+stop"></a>

### ddpReactiveDocument.stop()
Stops reactiveness for the document.

**Kind**: instance method of [<code>ddpReactiveDocument</code>](#ddpReactiveDocument)  
**Access**: public  
<a name="ddpReactiveDocument+data"></a>

### ddpReactiveDocument.data() ⇒ <code>Object</code>
Returns reactive document.

**Kind**: instance method of [<code>ddpReactiveDocument</code>](#ddpReactiveDocument)  
**Access**: public  
<a name="ddpReactiveDocument+onChange"></a>

### ddpReactiveDocument.onChange(f)
Runs a function every time a change occurs.

**Kind**: instance method of [<code>ddpReactiveDocument</code>](#ddpReactiveDocument)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function which recieves a new value at each change. |

<a name="ddpReactiveDocument+settings"></a>

### ddpReactiveDocument.settings(settings)
Change reactivity settings.

**Kind**: instance method of [<code>ddpReactiveDocument</code>](#ddpReactiveDocument)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| settings | <code>Object</code> | {preserve:true|false}. When preserve is true,reactive object won't change when corresponding object is being deleted. |

<a name="ddpReducer"></a>

## ddpReducer
A reducer class for a reactive document.

**Kind**: global class  

* [ddpReducer](#ddpReducer)
    * [new exports.ddpReducer(ddpReactiveCollectionInstance, reducer, initialValue)](#new_ddpReducer_new)
    * [.doReduce()](#ddpReducer+doReduce)
    * [.start()](#ddpReducer+start)
    * [.stop()](#ddpReducer+stop)
    * [.data()](#ddpReducer+data) ⇒ <code>Object</code>
    * [.onChange(f)](#ddpReducer+onChange)

<a name="new_ddpReducer_new"></a>

### new exports.ddpReducer(ddpReactiveCollectionInstance, reducer, initialValue)

| Param | Type | Description |
| --- | --- | --- |
| ddpReactiveCollectionInstance | [<code>ddpReactiveCollection</code>](#ddpReactiveCollection) | Instance of @see ddpReactiveCollection class. |
| reducer | <code>function</code> | Function for a reduction. |
| initialValue | <code>\*</code> | Initial value for a reduction function. |

<a name="ddpReducer+doReduce"></a>

### ddpReducer.doReduce()
Forcibly reduces reactive data.

**Kind**: instance method of [<code>ddpReducer</code>](#ddpReducer)  
**Access**: public  
<a name="ddpReducer+start"></a>

### ddpReducer.start()
Starts reactiveness for the reduced value of the collection.
This method is being called on instance creation.

**Kind**: instance method of [<code>ddpReducer</code>](#ddpReducer)  
**Access**: public  
<a name="ddpReducer+stop"></a>

### ddpReducer.stop()
Stops reactiveness.

**Kind**: instance method of [<code>ddpReducer</code>](#ddpReducer)  
**Access**: public  
<a name="ddpReducer+data"></a>

### ddpReducer.data() ⇒ <code>Object</code>
Returns reactive reduce.

**Kind**: instance method of [<code>ddpReducer</code>](#ddpReducer)  
**Returns**: <code>Object</code> - - {result:reducedValue}  
**Access**: public  
<a name="ddpReducer+onChange"></a>

### ddpReducer.onChange(f)
Runs a function every time a change occurs.

**Kind**: instance method of [<code>ddpReducer</code>](#ddpReducer)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function which recieves a reduced value at each change. |

<a name="ddpSubscription"></a>

## ddpSubscription
DDP subscription class.

**Kind**: global class  

* [ddpSubscription](#ddpSubscription)
    * [new exports.ddpSubscription(pubname, args, ddplink)](#new_ddpSubscription_new)
    * [.onNosub(f)](#ddpSubscription+onNosub) ⇒ [<code>ddpEventListener</code>](#ddpEventListener)
    * [.onReady(f)](#ddpSubscription+onReady) ⇒ [<code>ddpEventListener</code>](#ddpEventListener)
    * [.isReady()](#ddpSubscription+isReady) ⇒ <code>boolean</code>
    * [.isStopped()](#ddpSubscription+isStopped) ⇒ <code>boolean</code>
    * [.ready()](#ddpSubscription+ready) ⇒ <code>Promise</code>
    * [.nosub()](#ddpSubscription+nosub) ⇒ <code>Promise</code>
    * [.isOn()](#ddpSubscription+isOn) ⇒ <code>Promise</code>
    * [.remove()](#ddpSubscription+remove)
    * [.stop()](#ddpSubscription+stop) ⇒ <code>Promise</code>
    * [.start(args)](#ddpSubscription+start) ⇒ <code>Promise</code>
    * [.restart([args])](#ddpSubscription+restart) ⇒ <code>Promise</code>

<a name="new_ddpSubscription_new"></a>

### new exports.ddpSubscription(pubname, args, ddplink)

| Param | Type | Description |
| --- | --- | --- |
| pubname | <code>String</code> | Publication name. |
| args | <code>Array</code> | Subscription arguments. |
| ddplink | [<code>simpleDDP</code>](#simpleDDP) | simpleDDP instance. |

<a name="ddpSubscription+onNosub"></a>

### ddpSubscription.onNosub(f) ⇒ [<code>ddpEventListener</code>](#ddpEventListener)
Runs everytime when `nosub` message corresponding to the subscription comes from the server.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function, event handler. |

<a name="ddpSubscription+onReady"></a>

### ddpSubscription.onReady(f) ⇒ [<code>ddpEventListener</code>](#ddpEventListener)
Runs everytime when `ready` message corresponding to the subscription comes from the server.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function, event handler. |

<a name="ddpSubscription+isReady"></a>

### ddpSubscription.isReady() ⇒ <code>boolean</code>
Returns true if subsciprtion is ready otherwise false.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  
<a name="ddpSubscription+isStopped"></a>

### ddpSubscription.isStopped() ⇒ <code>boolean</code>
Returns true if subscription is stopped otherwise false.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  
<a name="ddpSubscription+ready"></a>

### ddpSubscription.ready() ⇒ <code>Promise</code>
Returns a promise which resolves when subscription is ready or rejects when `nosub` message arrives.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  
<a name="ddpSubscription+nosub"></a>

### ddpSubscription.nosub() ⇒ <code>Promise</code>
Returns a promise which resolves when corresponding `nosub` message arrives.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  
<a name="ddpSubscription+isOn"></a>

### ddpSubscription.isOn() ⇒ <code>Promise</code>
Returns true if subscription is active otherwise false.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  
<a name="ddpSubscription+remove"></a>

### ddpSubscription.remove()
Completly removes subscription.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  
<a name="ddpSubscription+stop"></a>

### ddpSubscription.stop() ⇒ <code>Promise</code>
Stops subscription and return a promise which resolves when subscription is stopped.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  
<a name="ddpSubscription+start"></a>

### ddpSubscription.start(args) ⇒ <code>Promise</code>
Start the subscription. Runs on class creation.
Returns a promise which resolves when subscription is ready.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | Subscription arguments. |

<a name="ddpSubscription+restart"></a>

### ddpSubscription.restart([args]) ⇒ <code>Promise</code>
Restart the subscription. You can also change subscription arguments.
Returns a promise which resolves when subscription is ready.

**Kind**: instance method of [<code>ddpSubscription</code>](#ddpSubscription)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [args] | <code>Array</code> | Subscription arguments. |
