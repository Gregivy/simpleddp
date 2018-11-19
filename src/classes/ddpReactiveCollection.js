export class ddpReactiveCollection {
	constructor(data,ddpFilterInstance) {
    this.changeHandler = undefined;
    this.syncFunc = function () {
      return ddpFilterInstance.fetch.call(ddpFilterInstance);
    };
    this.data = data;
		this.started = false;
    this._sort = ddpFilterInstance._sort;
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

	start() {
		if (!this.started) {
      this.data.splice(0,this.data.length,...this.syncFunc());
      if (this._sort) {
        this.data.sort(this._sort);
      }
			this.changeHandler.start();
			this.started = true;
		}
	}

  sortUpdate(newEl) {
    if (this._sort) {
      for (let i=0;i<this.data.length;i++) {
        if (this._sort(newEl,this.data[i])<1) {
          this.data.splice(i,0,newEl);
          break;
        }
        if (i==this.data.length-1) {
          this.data.push(newEl);
          break;
        }
      }
    } else {
      this.data.push(newEl);
    }
  }

  sort(f) {
    this._sort = f;
    this.data.sort(f);
    return this;
  }
}
