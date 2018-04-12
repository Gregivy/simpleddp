import DDP from 'ddp.js';
import { isEqual } from './isequal.js';
import { ddpEventListener } from './ddpeventlistener.js';
import { ddpSubscription } from './ddpsubscription.js';

export default class simpleDDP {
	constructor(opts) {
		this.ddpConnection = new DDP(opts);
		this.subs = [];
		this.collections = Object.create(null);

		this.readyEvent = this.addEvent('ready',(m)=>{
			let subs = m.subs;
			for (let i=0;i<this.subs.length;i++) {
				if (subs.length==0) break;
				let j = subs.indexOf(this.subs[i].subid);
				if (j>-1) {
					this.subs[i].ready = true;
					delete subs[j];
				}
			}
		});

		this.addedEvent = this.addEvent('added',this.dispatchAdded);
		this.changedEvent = this.addEvent('changed',this.dispatchChanged);
		this.removedEvent = this.addEvent('removed',this.dispatchRemoved);
	}

	dispatchAdded(m) {
		if (!this.collections.hasOwnProperty(m.collection)) this.collections[m.collection] = [];
		this.collections[m.collection].push(Object.assign({id:m.id},m.fields));
	}

	dispatchChanged(m) {
		let i = this.collections[m.collection].findIndex((obj)=>{
			return obj.id == m.id;
		});
		if (i>-1) {
			if (m.fields) {
				Object.assign(this.collections[m.collection][i],m.fields);
			}
			if (m.cleared) {
				m.cleared.forEach((fieldName)=>{
					delete this.collections[m.collection][i][fieldName];
				});
			}
		} else {
			this.dispatchAdded(m);
		}
	}

	dispatchRemoved(m) {
		let i = this.collections[m.collection].findIndex((obj)=>{
			return obj.id == m.id;
		});
		if (i>-1) {
			delete this.collections[m.collection][i];
		}
	}

	connect() {
		this.ddpConnection.connect();
	}

	disconnect() {
		this.ddpConnection.disconnect();
	}

	call(method,args) {
	  	return new Promise((resolve, reject) => {
			const methodId = this.ddpConnection.method(method,args?args:[]);
			const _self = this;
			this.ddpConnection.on("result", function onMethodResult(message) {
				if (message.id == methodId) {
					if (!message.error) {
						resolve(message);
					} else {
						reject(message);
					}
					_self.ddpConnection.removeListener('result',onMethodResult);
				}
			});
		});
	}

	sub(subname,args) {
		let hasSuchSub = this.subs.find((sub)=>{
			return sub.subname == subname && isEqual(sub.args,args?args:[]);
		});
		if (!hasSuchSub) {
			let i = this.subs.push(new ddpSubscription(subname,args?args:[],this));
			return this.subs[i-1];
		} else {
			return hasSuchSub;
		}
	}

	removeSub(subobj) {
		let i = this.subs.indexOf(subobj);
		if (i>-1) {
			subobj.stop();
			delete this.subs[i];
		}
	}

	addEvent(event,f) {
		return new ddpEventListener(event,f,this);
	}

	bindWith(obj) {

	}

}