# Adding custom EJSON types

Adding custom EJSON types is as simple as it is in Meteor.
First install `ejson` package:

`npm install ejson --save`

Import/require `EJSON`.

```javascript
const EJSON = require("ejson"); // nodejs
```

or

```javascript
import EJSON from 'ejson'; // ES6
```

And use method `addType`

```javascript
class Distance {
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }

  // Convert our type to JSON.
  toJSONValue() {
    return {
      value: this.value,
      unit: this.unit
    };
  }

  // Unique type name.
  typeName() {
    return 'Distance';
  }
}

EJSON.addType('Distance', function fromJSONValue(json) {
  return new Distance(json.value, json.unit);
});
```

*Don't forget to do the same as above in the server side code!*

[Read more in Meteor Docs](https://docs.meteor.com/api/ejson.html)

## Example, adding Decimal support

`npm install ejson decimal.js --save`

```javascript
// ejson_decimal.js
import EJSON from 'ejson';
import Decimal from 'decimal.js';

Decimal.prototype.typeName = function() {
  return 'Decimal';
};

Decimal.prototype.toJSONValue = function () {
  return this.toJSON();
};

Decimal.prototype.clone = function () {
  return Decimal(this.toString());
};

EJSON.addType('Decimal', function (str) {
  return Decimal(str);
});

export { Decimal };

// now you can use Decimal in your method calls, subscriptions
// and all the 'Decimal' data from server will be converted to Decimal object on client
```

## Example, adding MongoId support

`npm install ejson decimal.js --save`

```javascript
// ejson_decimal.js
import EJSON from 'ejson';

class MongoObjectId {
  constructor(str) {
    this.str = str;
  }

  // Convert our type to JSON.
  toJSONValue() {
    return this.value();
  }

  // Unique type name.
  typeName() {
    return 'oid';
  }

  value() {
    return this.str;
  }
}

EJSON.addType('oid', function fromJSONValue(str) {
  return new MongoObjectId(str);
});

export { MongoObjectId };
```
