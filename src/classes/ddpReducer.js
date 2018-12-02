/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */

export class ddpReducer {
	constructor(ddpReactiveCollectionInstance,reducer,initialValue) {
    this._ddpReactiveCollectionInstance = ddpReactiveCollectionInstance;
    this._reducer = reducer;
    this._started = false;
    this._data = {result:null};
    this._initialValue = initialValue;
    this.start();
	}

  doReduce() {
    if (this._started) {
      this._data.result = this._ddpReactiveCollectionInstance.data().reduce(this._reducer,this._initialValue);
    }
  }

  start() {
    if (!this._started) {
      this.doReduce();
      this._ddpReactiveCollectionInstance._activateReducer(this);
      this._started = true;
    }
  }

  stop() {
    if (this._started) {
      this._ddpReactiveCollectionInstance._deactivateReducer(this);
      this._started = false;
    }
  }

  data() {
    return this._data;
  }

}
