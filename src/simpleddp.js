import DDP from 'ddp.js';
import { isEqual } from './isequal.js';
import { ddpEventListener } from './ddpeventlistener.js';
import { ddpSubscription } from './ddpsubscription.js';

export default class simpleDDP {
	constructor(opts) {
		this.ddpConnection = new DDP(opts);
		this.subs = [];
		this.collections = {};
		this.onChangeFuncs = [];
		this.connected = false;

		this._objectIdPrefix = opts.idPrefix?opts.idPrefix:"_id";

		this.connectedEvent = this.on('connected',(m)=>{
			this.connected = true;
		});

		this.disconnectedEvent = this.on('disconnected',(m)=>{
			this.connected = false;
		});

		this.readyEvent = this.on('ready',(m)=>{
			let subs = m.subs;
			for (let i=0;i<this.subs.length;i++) {
				if (subs.length==0) break;
				let j = subs.indexOf(this.subs[i].subid);
				if (j>-1) {
					this.subs[i].ready = true;
					subs.splice(j,1);
				}
			}
		});

		this.addedEvent = this.on('added',(m) => this.dispatchAdded(m));
		this.changedEvent = this.on('changed',(m) => this.dispatchChanged(m));
		this.removedEvent = this.on('removed',(m) => this.dispatchRemoved(m));
	}

	dispatchAdded(m) {
		if (!this.collections.hasOwnProperty(m.collection)) this.collections[m.collection] = [];
		let newObj = Object.assign({id:m.id},m.fields);
		this.collections[m.collection].push(newObj);
		this.onChangeFuncs.forEach((l)=>{
			if (l.obj==this.collections[m.collection]) l.f({changed:false,added:newObj,removed:false});
		});
	}

	dispatchChanged(m) {
		let i = this.collections[m.collection].findIndex((obj)=>{
			return obj.id == m.id;
		});
		if (i>-1) {
			let prev = Object.assign({},this.collections[m.collection][i]);
			if (m.fields) {
				Object.assign(this.collections[m.collection][i],m.fields);
			}
			if (m.cleared) {
				m.cleared.forEach((fieldName)=>{
					delete this.collections[m.collection][i][fieldName];
				});
			}
			let next = Object.assign({},this.collections[m.collection][i]);
			this.onChangeFuncs.forEach((l)=>{
				if (l.obj==this.collections[m.collection]) {
					l.f({changed:{prev,next},added:false,removed:false});
				} else if (l.obj==this.collections[m.collection][i][this._objectIdPrefix]) {
					l.f({prev,next});
				}
			});
		} else {
			this.dispatchAdded(m);
		}
	}

	dispatchRemoved(m) {
		let i = this.collections[m.collection].findIndex((obj)=>{
			return obj.id == m.id;
		});
		if (i>-1) {
			let removedObj = this.collections[m.collection].splice(i,1);
			this.onChangeFuncs.forEach((l)=>{
				if (l.obj==this.collections[m.collection]) {
					l.f({changed:false,added:false,removed:removedObj});
				} else if (l.obj==removedObj[this._objectIdPrefix]) {
					l.f({prev:removedObj,next:false});
				}
			});
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
						resolve(message.result);
					} else {
						reject(message.error);
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
			this.subs.splice(i,1);
		}
	}

	on(event,f) {
		return new ddpEventListener(event,f,this);
	}

	onChange(obj,f) {
		let _obj = Array.isArray(obj) ? obj : obj[this._objectIdPrefix];
		let i = this.onChangeFuncs.push({obj:_obj,f});
		return this.onChangeFuncs[i-1];
	}

	stopOnChange(listener) {
		let i = this.onChangeFuncs.indexOf(listener);
		if (i>-1) {
			this.onChangeFuncs.splice(i,1);
		}
	}

}