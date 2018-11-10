import { fullCopy } from './fullCopy.js';

export class ddpCollection {
  constructor(name,server) {
    this.name = name;
    this.server = server;
	}

  filter(f) {
    return new ddpFilter(this,f);
  }

  fetch() {
    let c = this.server.collections[this.name];
    return c ? fullCopy(c) : [];
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
  constructor(ddpCollectionInstance,f) {
    this.server = ddpCollectionInstance.server;
    this.collection = ddpCollectionInstance.name;
    this.ddpCollectionFetch = function () {
      return ddpCollectionInstance.fetch.call(ddpCollectionInstance);
    };
    this.f = f;
	}

  fetch() {
    return this.ddpCollectionFetch().filter(this.f);
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
