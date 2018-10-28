# Create a plugin

If you want to create your own plugin simply create a js object with `init` property and pass it to `simpleDDP` constructor.

```javascript
export default const mySuperPlugin = {
  init: function () {
    // we use this here as an instance link of simpleDDP class
    // here we create a plugin which counts methods calls

    this._methodCount = 0; // counter initial value
    this._oldCall = this.call; // save standard simpleDDP call function

    // defining new call function
    this.call = () => {
      this._methodCount++;
      return this._oldCall(arguments);
    };

    // method shows total number of calls
    this.newSuperFunction = () => {
      return this._methodCount;
    };
  }
};
```

If you plan to make you plugin public please publish it on *npm* with prefix name *simpleddp-plugin-* and tell about your plugin at *simpleDDP* github issues.
