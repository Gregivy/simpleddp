/**
 * DDP change listener class.
 * @constructor
 * @param {Object} obj - Describes changes of interest.
 * @param {simpleDDP} server - simpleDDP instance.
 */

export class ddpOnChange {
  constructor(obj,server,listenersArray = 'onChangeFuncs') {
    this._obj = obj;
    this._server = server;
    this._isStopped = true;
    this._listenersArray = listenersArray;
    this.start();
	}

  /**
   * Stops change listener.
   * @public
   */
  stop() {
    let i = this._server[this._listenersArray].indexOf(this._obj);
    if (i>-1) {
      this._isStopped = true;
      this._server[this._listenersArray].splice(i,1);
    }
  }

  /**
   * Start change listener. This method is being called on instance creation.
   * @public
   */
  start() {
    if (this._isStopped) {
      this._server[this._listenersArray].push(this._obj);
      this._isStopped = false;
    }
  }
}
