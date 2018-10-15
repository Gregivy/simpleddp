import DDP from 'ddp.js';
import { isEqual } from './isequal.js';
import { ddpEventListener, ddpSubscription, ddpCollection } from './ddpclasses.js';

export default class simpleDDP {
	constructor(opts) {
		this.ddpConnection = new DDP(opts);
		this.subs = [];
		this.collections = {};
		this.onChangeFuncs = [];
		this.connected = false;
		this.tryingToConnect = opts.autoReconnect === undefined ? true : opts.autoReconnect;

		this.connectedEvent = this.on('connected',(m)=>{
			this.connected = true;
			this.tryingToConnect = false;
		});

		this.disconnectedEvent = this.on('disconnected',(m)=>{
			this.connected = false;
			this.tryingToConnect = opts.autoReconnect === undefined ? true : opts.autoReconnect;
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

	collection(name) {
		return new ddpCollection(name,this);
	}

	dispatchAdded(m) {
		if (!this.collections.hasOwnProperty(m.collection)) this.collections[m.collection] = [];
		let newObj = Object.assign({id:m.id},m.fields);
		let i = this.collections[m.collection].push(newObj);
		this.onChangeFuncs.forEach((l)=>{
			if (l.collection==m.collection) {
				let hasFilter = l.hasOwnProperty('filter');
				if ((hasFilter && l.filter(newObj,i-1,this.collections[m.collection])) || !hasFilter) {
					l.f({changed:false,added:newObj,removed:false});
				}
			}
		});
	}

	dispatchChanged(m) {
		let i = this.collections[m.collection].findIndex((obj)=>{
			return obj.id == m.id;
		});
		if (i>-1) {
			let prev = Object.assign({},this.collections[m.collection][i]);
			let fields, fieldsChanged, fieldsRemoved;
			if (m.fields) {
				fieldsChanged = Object.assign({},m.fields);
				fields = Object.assign({},m.fields);
				Object.keys(m.fields).map((p)=>{
					fields[p] = 1;
				});
				Object.assign(this.collections[m.collection][i],m.fields);
			}
			if (m.cleared) {
				fieldsRemoved = m.cleared;
				m.cleared.forEach((fieldName)=>{
					fields[fieldName] = 0;
					delete this.collections[m.collection][i][fieldName];
				});
			}
			let next = Object.assign({},this.collections[m.collection][i]);
			this.onChangeFuncs.forEach((l)=>{
				if (l.collection==m.collection) {
					let hasFilter = l.hasOwnProperty('filter');
					if (!hasFilter) {
						l.f({changed:{prev,next,fields,fieldsChanged,fieldsRemoved},added:false,removed:false});
					} else if (hasFilter && l.filter(prev,i,this.collections[m.collection])) {
						l.f({prev,next,fields,fieldsChanged,fieldsRemoved});
					}
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
			let prevProps;
			let removedObj = this.collections[m.collection].splice(i,1);
			this.onChangeFuncs.forEach((l)=>{
				if (l.collection==m.collection) {
					let hasFilter = l.hasOwnProperty('filter');
					if (!hasFilter) {
						l.f({changed:false,added:false,removed:removedObj[0]});
					} else if (hasFilter && l.filter(removedObj,i,this.collections[m.collection])) {
						l.f({prev:removedObj[0],next:false});
					}
				}
			});
		}
	}

	connect() {
		return new Promise((resolve, reject) => {
			if (!this.tryingToConnect) {
				this.ddpConnection.connect();
				this.tryingToConnect = true;
			}
			if (!this.connected) {
				let connectionHandler = this.on('connected', () => {
					connectionHandler.stop();
					this.tryingToConnect = false;
					resolve();
				});
			} else {
				resolve();
			}
		});
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

	stopChangeListeners() {
		this.onChangeFuncs = [];
	}

}
