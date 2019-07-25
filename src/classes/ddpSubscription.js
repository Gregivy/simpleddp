/**
 * DDP subscription class.
 * @constructor
 * @param {String} pubname - Publication name.
 * @param {Array} args - Subscription arguments.
 * @param {simpleDDP} ddplink - simpleDDP instance.
 */

export class ddpSubscription {
	constructor(pubname, args, ddplink) {
		this._ddplink = ddplink;
		this.pubname = pubname;
		this.args = args;
    this._nosub = false;
		this._started = false;
		this._ready = false;

    this.selfReadyEvent = ddplink.on('ready', (m) => {
      if (m.subs.includes(this.subscriptionId)) {
        this._ready = true;
        this._nosub = false;
      }
    });

    this.selfNosubEvent = ddplink.on('nosub', (m) => {
      if (m.id==this.subscriptionId) {
        this._ready = false;
        this._nosub = true;
        this._started = false;
      }
    });

    this.start();
	}

	/**
	 * Runs everytime when `nosub` message corresponding to the subscription comes from the server.
	 * @public
	 * @param {Function} f - Function, event handler.
	 * @return {ddpEventListener}
	 */
  onNosub(f) {
    if (this.isStopped()) {
      f();
    } else {
      let onNs = this._ddplink.on('nosub', (m) => {
        if (m.id==this.subscriptionId) {
          f(m.error);
        }
      });
      return onNs;
    }
  }

	/**
	 * Runs everytime when `ready` message corresponding to the subscription comes from the server.
	 * @public
	 * @param {Function} f - Function, event handler.
	 * @return {ddpEventListener}
	 */
  onReady(f) {
    // может приходить несколько раз, нужно ли сохранять куда-то?
		if (this.isReady()) {
			f();
		} else {
			let onReady = this._ddplink.on('ready', (m) => {
				if (m.subs.includes(this.subscriptionId)) {
					f();
				}
			});
			return onReady;
		}
	}

	/**
	 * Returns true if subsciprtion is ready otherwise false.
	 * @public
	 * @return {boolean}
	 */
  isReady() {
    return this._ready;
  }

	/**
	 * Returns true if subscription is stopped otherwise false.
	 * @public
	 * @return {boolean}
	 */
  isStopped() {
    return this._nosub;
  }

	/**
	 * Returns a promise which resolves when subscription is ready or rejects when `nosub` message arrives.
	 * @public
	 * @return {Promise}
	 */
  ready() {
		return new Promise((resolve, reject) => {
      if (this.isReady()) {
        resolve();
      } else {
        let onReady = this._ddplink.on('ready', (m) => {
  				if (m.subs.includes(this.subscriptionId)) {
  					onReady.stop();
            onNosub.stop();
  					resolve();
  				}
  			});
        let onNosub = this._ddplink.on('nosub', (m) => {
  				if (m.id == this.subscriptionId) {
  					onNosub.stop();
            onReady.stop();
  					reject(m.error);
  				}
  			});
      }
    });
	}

	/**
	 * Returns a promise which resolves when corresponding `nosub` message arrives.
	 * @public
	 * @return {Promise}
	 */
  nosub() {
    return new Promise((resolve, reject) => {
      if (this.isStopped()) {
        resolve();
      } else {
        let onNosub = this._ddplink.on('nosub', (m) => {
          if (m.id==this.subscriptionId) {
            this._nosub = true;

            onNosub.stop();
            resolve();
          }
        });
      }
    });
  }

	/**
	 * Returns true if subscription is active otherwise false.
	 * @public
	 * @return {Promise}
	 */
	isOn() {
		return this._started;
	}

	/**
	 * Completly removes subscription.
	 * @public
	 */
	remove() {
    // stopping nosub listener
    this.selfNosubEvent.stop();
    // stopping the subscription and ready listener
		this.stop();
    // removing from sub list inside simpleDDP instance
    let i = this._ddplink.subs.indexOf(this);
		if (i>-1) {
			this._ddplink.subs.splice(i,1);
		}
	}

	/**
	 * Stops subscription and return a promise which resolves when subscription is stopped.
	 * @public
	 * @return {Promise}
	 */
	stop() {
		if (this._started) {
      // stopping ready listener
      this.selfReadyEvent.stop();
      // unsubscribing
      if (!this._nosub) this._ddplink.ddpConnection.unsub(this.subscriptionId);
			this._started = false;
			this._ready = false;
		}
    return this.nosub();
	}

	/**
	 * Returns subscription id.
	 * @private
	 * @return {Promise}
	 */
	_getId() {
		return this.subscriptionId;
	}

	/**
	 * Start the subscription. Runs on class creation.
	 * Returns a promise which resolves when subscription is ready.
	 * @public
	 * @param {Array} args - Subscription arguments.
	 * @return {Promise}
	 */
	start(args) {
		if (!this._started) {
      // starting ready listener
      this.selfReadyEvent.start();
      // subscribing
			if (Array.isArray(args)) this.args = args;
			this.subscriptionId = this._ddplink.ddpConnection.sub(this.pubname,this.args);
			this._started = true;
		}
    return this.ready();
	}

	/**
	 * Restart the subscription. You can also change subscription arguments.
	 * Returns a promise which resolves when subscription is ready.
	 * @public
	 * @param {Array} [args] - Subscription arguments.
	 * @return {Promise}
	 */
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
