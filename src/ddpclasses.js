export class ddpCollection {
  constructor(name,server) {
    this.server = server;
    this.name = name;

	}

  filter(f) {
    return new ddpFilter(this.name,f,this.server);
  }

  fetch() {
    return this.server.collections[this.name];
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
  constructor(collection,f,server) {
    this.server = server;
    this.collection = collection;
    this.f = f;
	}

  fetch() {
    return this.server.collections[this.collection].filter(this.f);
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
		this.ready = false;
		this.start();
	}

	onReady(f) {
		if (this.isReady()) {
			f();
		} else {
			let onReady = this.ddplink.on('ready', (m) => {
				if (m.subs.indexOf(this.subid)) {
					//if (once) {
						onReady.stop();
					//}
					f();
				}
			});
			return onReady;
		}
	}

	isReady() {
		return this.ready;
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
			this.ready = false;
		}
	}

	start() {
		if (!this.started) {
			this.subid = this.ddplink.ddpConnection.sub(this.subname,this.args);
			this.started = true;
		}
	}
}
