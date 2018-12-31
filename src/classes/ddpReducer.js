import { ddpOnChange } from './ddpOnChange.js';

/**
 * A reducer class for a reactive document.
 * @constructor
 * @param {ddpReactiveCollection} ddpReactiveCollectionInstance - Instance of @see ddpReactiveCollection class.
 * @param {Function} reducer - Function for a reduction.
 * @param {*} initialValue - Initial value for a reduction function.
 */

export class ddpReducer {
	constructor(ddpReactiveCollectionInstance,reducer,initialValue) {
    this._ddpReactiveCollectionInstance = ddpReactiveCollectionInstance;
    this._reducer = reducer;
    this._started = false;
    this._data = {result:null};
		this._tickers = [];
    this._initialValue = initialValue;
    this.start();
	}

	/**
   * Forcibly reduces reactive data.
   * @public
   */
  doReduce() {
    if (this._started) {
      this._data.result = this._ddpReactiveCollectionInstance.data().reduce(this._reducer,this._initialValue);
			this._tickers.forEach((ticker)=>{
				ticker(this.data().result);
			});
    }
  }

	/**
	 * Starts reactiveness for the reduced value of the collection.
	 * This method is being called on instance creation.
	 * @public
	 */
  start() {
    if (!this._started) {
      this.doReduce();
      this._ddpReactiveCollectionInstance._activateReducer(this);
      this._started = true;
    }
  }

	/**
	 * Stops reactiveness.
	 * @public
	 */
  stop() {
    if (this._started) {
      this._ddpReactiveCollectionInstance._deactivateReducer(this);
      this._started = false;
    }
  }

	/**
	 * Returns reactive reduce.
	 * @public
	 * @return {Object} - {result:reducedValue}
	 */
  data() {
    return this._data;
  }

	/**
	 * Runs a function every time a change occurs.
	 * @param {Function} f - Function which recieves a reduced value at each change.
	 * @public
	 */
	onChange(f) {
		return new ddpOnChange(f,this,'_tickers');
	}

}
