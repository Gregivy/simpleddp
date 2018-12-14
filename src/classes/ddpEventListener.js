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
   * Stops event listener.
   * @public
   */
	stop() {
		if (this._started) {
			this._ddplink.ddpConnection.removeListener(this._eventname,this._f);
			this._started = false;
		}
	}

	/**
   * Start event listener. This method is being called on instance creation.
   * @public
   */
	start() {
		if (!this._started) {
			this._ddplink.ddpConnection.on(this._eventname,this._f);
			this._started = true;
		}
	}
}
