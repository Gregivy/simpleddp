export class ddpSubscription {
	constructor(subname, args, ddplink) {
		this.ddplink = ddplink;
		this.subname = subname;
		this.args = args;
    this._nosub = false;
		this.started = false;
		this._ready = false;

    this.selfReadyEvent = ddplink.on('ready', (m) => {
      if (m.subs.includes(this.subid)) {
        this._ready = true;
        this._nosub = false;
      }
    });

    this.selfNosubEvent = ddplink.on('nosub', (m) => {
      if (m.id==this.subid) {
        this._ready = false;
        this._nosub = true;
        this.started = false;
      }
    });

    this.start();
	}

  onNosub(f) {
    if (this.isStopped()) {
      f();
    } else {
      let onNs = this.ddplink.on('nosub', (m) => {
        if (m.id==this.subid) {
          f(m.error);
        }
      });
      return onNs;
    }
  }

  onReady(f) {
    // может приходить несколько раз, нужно ли сохранять куда-то?
		if (this.isReady()) {
			f();
		} else {
			let onReady = this.ddplink.on('ready', (m) => {
				if (m.subs.includes(this.subid)) {
					f();
				}
			});
			return onReady;
		}
	}

  isReady() {
    return this._ready;
  }

  isStopped() {
    return this._nosub;
  }

  ready() {
		return new Promise((resolve, reject) => {
      if (this.isReady()) {
        resolve();
      } else {
        let onReady = this.ddplink.on('ready', (m) => {
  				if (m.subs.includes(this.subid)) {
  					onReady.stop();
            onNosub.stop();
  					resolve();
  				}
  			});
        let onNosub = this.ddplink.on('nosub', (m) => {
  				if (m.id == this.subid) {
  					onNosub.stop();
            onReady.stop();
  					reject(m.error);
  				}
  			});
      }
    });
	}

  nosub() {
    return new Promise((resolve, reject) => {
      if (this.isStopped()) {
        resolve();
      } else {
        let onNosub = this.ddplink.on('nosub', (m) => {
          if (m.id==this.subid) {
            this._nosub = true;

            onNosub.stop();
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
    // stopping nosub listener
    this.selfNosubEvent.stop();
    // stopping the subscription and ready listener
		this.stop();
    // removing from sub list inside simpleDDP instance
    let i = this.ddplink.subs.indexOf(this);
		if (i>-1) {
			this.ddplink.subs.splice(i,1);
		}
	}

	stop() {
		if (this.started) {
      // stopping ready listener
      this.selfReadyEvent.stop();
      // unsubscribing
      if (!this._nosub) this.ddplink.ddpConnection.unsub(this.subid);
			this.started = false;
			this._ready = false;
		}
    return this.nosub();
	}

	start(args) {
		if (!this.started) {
      // starting ready listener
      this.selfReadyEvent.start();
      // subscribing
			this.subid = this.ddplink.ddpConnection.sub(this.subname,Array.isArray(args)?args:this.args);
			this.started = true;
		}
    return this.ready();
	}

  restart(args) {
    return new Promise((resolve, reject) => {
      this.stop().then(()=>{
        this.start(args).then(()=>{
          resolve();
        });
      });
    });
	}
}
