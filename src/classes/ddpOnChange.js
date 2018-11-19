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
