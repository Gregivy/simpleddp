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
			let onReady = this.ddplink.addEvent('ready', (m) => {
				if (m.subs.indexOf(this.subid)) {
					onReady.stop();
					f();
				}
			});
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