/**
 * DDP change listener class.
 * @constructor
 * @param {Object} obj - Describes changes of interest.
 * @param {simpleDDP} server - simpleDDP instance.
 */

export class ddpOnChange {
  constructor(obj,server) {
    this._obj = obj;
    this._server = server;
    this._isStopped = true;
    this.start();
	}

  /**
   * Stops change listener.
   * @public
   */
  stop() {
    let i = this._server.onChangeFuncs.indexOf(this._obj);
    if (i>-1) {
      this._isStopped = true;
      this._server.onChangeFuncs.splice(i,1);
    }
  }

  /**
   * Start change listener. This method is being called on instance creation.
   * @public
   */
  start() {
    if (this._isStopped) {
      this._server.onChangeFuncs.push(this._obj);
      this._isStopped = false;
    }
  }
}
