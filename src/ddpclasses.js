import { fullCopy } from './fullCopy.js';

export class ddpCollection {
  constructor(name,server) {
    this.name = name;
    this.server = server;
    this._sort = undefined;
	}

  filter(f) {
    return new ddpFilter(this,f,this._sort);
  }

  fetch() {
    let c = this.server.collections[this.name];
    let collectionCopy = c ? fullCopy(c) : [];
    return this._sort?collectionCopy.sort(this._sort):collectionCopy;
  }

  sort(f) {
    this._sort = f;
    return this;
  }

  reactive() {
    return this.filter((_)=>true).reactive();
  }

  reactiveOne() {
    return this.filter((_)=>true).reactiveOne();
  }

  onChange(f) {
    let obj = {
      collection: this.name,
      f: f
    };

    return new ddpOnChange(obj,this.server);
  }

}

export class ddpFilter {
  constructor(ddpCollectionInstance,f,sort) {
    this.server = ddpCollectionInstance.server;
    this.collection = ddpCollectionInstance.name;
    this.ddpCollectionFetch = function () {
      return ddpCollectionInstance.fetch.call(ddpCollectionInstance);
    };
    this.f = f;
    this._sort = sort;
    this.reactiveFetchListener;
	}

  sort(f) {
    this._sort = f;
    return this;
  }

  fetch() {
    let fetched = this.ddpCollectionFetch().filter(this.f);
    return this._sort?fetched.sort(this._sort):fetched;
  }

  reactive() {
    let newCollection = this.fetch();

    let reactiveSource = new ddpReactiveCollection(newCollection,this);

    this.reactiveFetchListener = this.onChange(({prev,next,predicatePassed})=>{
      if (prev && next) {
        if (predicatePassed[0]==0 && predicatePassed[1]==1) {
          // prev falling, next passing filter, adding new element with sort
          reactiveSource.sortUpdate(next);
        } else if (predicatePassed[0]==1 && predicatePassed[1]==0) {
          // prev passing, next falling filter, removing old element
          let i = newCollection.findIndex((obj)=>{
      			return obj.id == prev.id;
      		});
          newCollection.splice(i,1);
        } else if (predicatePassed[0]==1 && predicatePassed[1]==1) {
          // both passing, should delete previous and add new
          let i = newCollection.findIndex((obj)=>{
      			return obj.id == prev.id;
      		});
          newCollection.splice(i,1);
          reactiveSource.sortUpdate(next);
        }
      } else if (!prev && next) {
        // element was added and is passing the filter
        // adding new element with sort
        reactiveSource.sortUpdate(next);
      } else if (prev && !next) {
        // element was removed and is passing the filter, so it was in newCollection
        // removing old element
        let i = newCollection.findIndex((obj)=>{
          return obj.id == prev.id;
        });
        newCollection.splice(i,1);
      }
    });

    reactiveSource.setChangeHandler(this.reactiveFetchListener);

    return reactiveSource;
  }

  reactiveOne() {
    let syncedData = this.fetch();
    let newObject = syncedData[0]?syncedData[0]:{};

    let reactiveSource = new ddpReactiveObject(newObject,this);

    this.reactiveFetchListener = this.onChange(({prev,next,predicatePassed})=>{
      if (prev && next) {
        if (predicatePassed[0]==1 && predicatePassed[1]==0) {
          reactiveSource.update(false);
        } else {
          reactiveSource.update(next);
        }
      } else {
        reactiveSource.update(next);
      }
    });

    reactiveSource.setChangeHandler(this.reactiveFetchListener);

    return reactiveSource;
  }

  onChange(f) {
    let obj = {
      collection: this.collection,
      filter: this.f,
      f: f
    };

    return new ddpOnChange(obj,this.server);
  }
}


export class ddpOnChange {
  constructor(obj,server) {
    this.obj = obj;
    this.server = server;
    this.isStopped = true;
    this.start();
	}

  stop() {
    let i = this.server.onChangeFuncs.indexOf(this.obj);
    if (i>-1) {
      this.isStopped = true;
      this.server.onChangeFuncs.splice(i,1);
    }
  }

  start() {
    if (this.isStopped) {
      this.server.onChangeFuncs.push(this.obj);
      this.isStopped = false;
    }
  }
}

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

export class ddpReactiveObject{
	constructor(data,ddpFilterInstance) {
    this.changeHandler = undefined;
    this.syncFunc = function () {
      return ddpFilterInstance.fetch.call(ddpFilterInstance);
    };;
    this.data = data;
		this.started = false;
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
      this.update(this.syncFunc()[0]);
			this.changeHandler.start();
			this.started = true;
		}
	}

  update(newVal) {
    //keep the same object
    if (newVal) {
      Object.assign(this.data,newVal);
    } else {
      Object.keys(this.data).forEach((key) => { delete this.data[key]; });
    }
  }
}

export class ddpEventListener {
	constructor(eventname, f, ddplink) {
		this.ddplink = ddplink;
		this.eventname = eventname;
		this.f = f;
		this.started = false;
		this.start();
	}

	stop() {
		if (this.started) {
			this.ddplink.ddpConnection.removeListener(this.eventname,this.f);
			this.started = false;
		}
	}

	start() {
		if (!this.started) {
			this.ddplink.ddpConnection.on(this.eventname,this.f);
			this.started = true;
		}
	}
}

export class ddpSubscription {
	constructor(subname, args, ddplink) {
		this.ddplink = ddplink;
		this.subname = subname;
		this.args = args;
		this.started = false;
		this._ready = false;
		this.start();
	}

  onReady(f) {
		if (this.isReady()) {
			f();
		} else {
			let onReady = this.ddplink.on('ready', (m) => {
				if (m.subs.includes(this.subid)) {
          this._ready = true;
					onReady.stop();
					f();
				}
			});
			return onReady;
		}
	}

  isReady() {
    return this._ready;
  }

  ready() {
		return new Promise((resolve, reject) => {
      if (this.isReady()) {
        resolve();
      } else {
        let onReady = this.ddplink.on('ready', (m) => {
  				if (m.subs.includes(this.subid)) {
            this._ready = true;
  					onReady.stop();
  					resolve();
  				}
  			});
      }
    });
	}

	isOn() {
		return this.started;
	}

	remove() {
		if (this.started) this.stop();
		this.ddplink.removeSub(this);
	}

	stop() {
		if (this.started) {
			this.ddplink.ddpConnection.unsub(this.subid);
			this.started = false;
			this._ready = false;
		}
	}

	start() {
		if (!this.started) {
			this.subid = this.ddplink.ddpConnection.sub(this.subname,this.args);
			this.started = true;
		}
	}
}
