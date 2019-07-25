import { ddpOnChange } from './ddpOnChange.js';

/**
 * A reactive document class.
 * @constructor
 * @param {ddpReactiveCollection} ddpReactiveCollectionInstance - Instance of @see ddpReactiveCollection class.
 * @param {Object} [settings={preserve:false}] - Settings for reactive object. When preserve is true,
 * reactive object won't change when corresponding object is being deleted.
 */

export class ddpReactiveDocument{
	constructor(ddpReactiveCollectionInstance,settings) {
		this._ddpReactiveCollectionInstance = ddpReactiveCollectionInstance;
    this._started = false;
    this._data = {};
		this._tickers = [];
		this._preserve = false;
		if (typeof settings === 'object' && settings !== null) this.settings(settings);
    this.start();
	}

	/**
	 * Updates reactive object from local collection copies.
	 * @private
	 * @param {Object} newState - Document's new state.
	 */
	_update(newState) {
		if (newState) {
			//clean object
			Object.keys(this._data).forEach((key) => { delete this._data[key]; });
			//assign new state
			Object.assign(this._data,newState);
		} else {
			// no object clean if not preserved
			if (!this._preserve) {
				Object.keys(this._data).forEach((key) => { delete this._data[key]; });
			}
		}

		this._tickers.forEach((ticker)=>{
			ticker(this.data());
		});
	}

	/**
	 * Starts reactiveness for the document. This method is being called on instance creation.
	 * @public
	 */
	start() {
		if (!this._started) {
      this._update(this._ddpReactiveCollectionInstance.data()[0]);
			this._ddpReactiveCollectionInstance._activateReactiveObject(this);
			this._started = true;
		}
	}

	/**
	 * Stops reactiveness for the document.
	 * @public
	 */
	stop() {
		if (this._started) {
			this._ddpReactiveCollectionInstance._deactivateReactiveObject(this);
			this._started = false;
		}
	}

	/**
	 * Returns reactive document.
	 * @public
	 * @return {Object}
	 */
	data() {
		return this._data;
	}

	/**
	 * Runs a function every time a change occurs.
	 * @param {Function} f - Function which recieves a new value at each change.
	 * @public
	 */
	onChange(f) {
		return new ddpOnChange(f,this,'_tickers');
	}

	/**
	 * Change reactivity settings.
	 * @param {Object} settings - {preserve:true|false}.
	 * When preserve is true,reactive object won't change when corresponding object is being deleted.
	 * @public
	 */
  settings({preserve}) {
    this._preserve = !!preserve;
  }
}
