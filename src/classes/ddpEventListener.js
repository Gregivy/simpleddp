/**
 * DDP event listener class.
 * @constructor
 * @param {String} eventname - Event name.
 * @param {Function} f - Function to run when event is fired.
 * @param {simpleDDP} ddplink - simpleDDP instance.
 */

export class ddpEventListener {
	constructor(eventname, f, ddplink) {
		this._ddplink = ddplink;
		this._eventname = eventname;
		this._f = f;
		this._started = false;
		this.start();
	}

	/**
   * Stops listening for server `event` messages.
	 * You can start any stopped @see ddpEventListener at any time using `ddpEventListener.start()`.
   * @public
   */
	stop() {
		if (this._started) {
			this._ddplink.ddpConnection.removeListener(this._eventname,this._f);
			this._started = false;
		}
	}

	/**
	 * Usually you won't need this unless you stopped the @see ddpEventListener.
	 * @see ddpEventListener starts on creation.
   * @public
   */
	start() {
		if (!this._started) {
			this._ddplink.ddpConnection.on(this._eventname,this._f);
			this._started = true;
		}
	}
}
