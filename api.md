## Classes

<dl>
<dt><a href="#ddpReactiveCollection">ddpReactiveCollection</a></dt>
<dd><p>A reactive collection class.</p>
</dd>
<dt><a href="#ddpReducer">ddpReducer</a></dt>
<dd><p>Represents a book.</p>
</dd>
</dl>

<a name="ddpReactiveCollection"></a>

## ddpReactiveCollection
A reactive collection class.

**Kind**: global class  

* [ddpReactiveCollection](#ddpReactiveCollection)
    * [new exports.ddpReactiveCollection(ddpFilterInstance, [skiplimit])](#new_ddpReactiveCollection_new)
    * [.settings([skiplimit])](#ddpReactiveCollection+settings)
    * [.stop()](#ddpReactiveCollection+stop)
    * [.start()](#ddpReactiveCollection+start)
    * [.sort(f)](#ddpReactiveCollection+sort) ⇒ <code>this</code>
    * [.data()](#ddpReactiveCollection+data) ⇒ <code>Array</code>
    * [.map(f)](#ddpReactiveCollection+map) ⇒ [<code>ddpReducer</code>](#ddpReducer)
    * [.reduce(f, initialValue)](#ddpReactiveCollection+reduce) ⇒ [<code>ddpReducer</code>](#ddpReducer)
    * [.count()](#ddpReactiveCollection+count) ⇒ <code>Object</code>

<a name="new_ddpReactiveCollection_new"></a>

### new exports.ddpReactiveCollection(ddpFilterInstance, [skiplimit])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| ddpFilterInstance | <code>ddpFilter</code> |  | Instance of ddpFilter class. |
| [skiplimit] | <code>Object</code> | <code>{skip:0,limit:Infinity}</code> | Object for declarative reactive collection slicing. |

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
Stops reactivity

**Kind**: instance method of [<code>ddpReactiveCollection</code>](#ddpReactiveCollection)  
**Access**: public  
<a name="ddpReactiveCollection+start"></a>

### ddpReactiveCollection.start()
Start reactivity. This method is being called on instance creation.

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
<a name="ddpReducer"></a>

## ddpReducer
Represents a book.

**Kind**: global class  
<a name="new_ddpReducer_new"></a>

### new exports.ddpReducer(title, author)

| Param | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The title of the book. |
| author | <code>string</code> | The author of the book. |

