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
