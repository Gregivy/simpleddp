export class ddpReactiveObject{
	constructor(ddpReactiveCollectionInstance,settings) {
		this._ddpReactiveCollectionInstance = ddpReactiveCollectionInstance;
    this._started = false;
    this._data = {};
		this._preserve = false;
		if (typeof settings === 'object' && settings !== null) this.settings(settings);
    this.start();
	}

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
	}

	start() {
		if (!this._started) {
      this._update(this._ddpReactiveCollectionInstance.data()[0]);
			this._ddpReactiveCollectionInstance._activateReactiveObject(this);
			this._started = true;
		}
	}

	stop() {
		if (this._started) {
			this._ddpReactiveCollectionInstance._deactivateReactiveObject(this);
			this._started = false;
		}
	}

	data() {
		return this._data;
	}

  settings({preserve}) {
    this._preserve = !!preserve;
  }
}
