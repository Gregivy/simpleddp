/**
 * DDP change listener class.
 * @constructor
 * @param {Object} obj - Describes changes of interest.
 * @param {*} inst - Event handler instance.
 * @param {simpleDDP} [listenersArray = 'onChangeFuncs'] - Property name of event handler instance, array of listeners.
 */

export class ddpOnChange {
  constructor(obj,inst,listenersArray = 'onChangeFuncs') {
    this._obj = obj;
    this._inst = inst;
    this._isStopped = true;
    this._listenersArray = listenersArray;
    this.start();
	}

  /**
   * Stops change listener.
   * @public
   */
  stop() {
    let i = this._inst[this._listenersArray].indexOf(this._obj);
    if (i>-1) {
      this._isStopped = true;
      this._inst[this._listenersArray].splice(i,1);
    }
  }

  /**
   * Start change listener. This method is being called on instance creation.
   * @public
   */
  start() {
    if (this._isStopped) {
      this._inst[this._listenersArray].push(this._obj);
      this._isStopped = false;
    }
  }
}
