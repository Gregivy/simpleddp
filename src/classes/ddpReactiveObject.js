export class ddpReactiveObject{
	constructor(data,ddpFilterInstance,settings) {
    this.changeHandler = undefined;
    this.syncFunc = function () {
      return ddpFilterInstance.fetch.call(ddpFilterInstance);
    };;
    this.data = data;
		this.started = false;
    if (settings) this.settings(settings);
	}

  setChangeHandler(h) {
    this.stop();
    this.changeHandler = h;
    this.start();
  }

	stop() {
		if (this.started) {
			this.changeHandler.stop();
			this.started = false;
		}
	}

  settings({preserve}) {
    this.preserve = !!preserve;
  }

	start() {
		if (!this.started) {
      this.update(this.syncFunc()[0]);
			this.changeHandler.start();
			this.started = true;
		}
	}

  update(newVal,prev,fieldsRemoved) {
    //keep the same object
    if (newVal) {

      if (!prev) {
        Object.keys(this.data).forEach((key) => {
          if (!newVal.hasOwnProperty(key))
            delete this.data[key];
        });
      }
      // should add new fields, modify existing and delete removed
      //adding and modifying
      Object.assign(this.data,newVal);
      //deleting
      if (Array.isArray(fieldsRemoved)) {
        fieldsRemoved.forEach((field)=>{
          delete this.data[field];
        });
      }
    } else {
      if (!this.preserve) {
        Object.keys(this.data).forEach((key) => { delete this.data[key]; });
      }
    }
  }
}
