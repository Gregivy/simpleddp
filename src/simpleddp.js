import DDP from 'simpleddp-core';
import EJSON from "ejson";

import { isEqual } from './helpers/isequal.js';
import { fullCopy } from './helpers/fullCopy.js';

import { ddpEventListener } from './classes/ddpEventListener.js';
import { ddpSubscription } from './classes/ddpSubscription.js';
import { ddpCollection } from './classes/ddpCollection.js';

function uniqueIdFuncGen() {
	let idCounter = 0;

	return function () {
		return idCounter++;
	}
}

const simpleDDPcounter = uniqueIdFuncGen();

function connectPlugins(plugins,...places) {
	if (Array.isArray(plugins)) {
		plugins.forEach((p)=>{
			places.forEach((place)=>{
				if (p[place]) {
					p[place].call(this);
				}
			});
		});
	}
}

export default class simpleDDP {
	constructor(opts,plugins) {
		this._id = simpleDDPcounter();
		this._opGenId = uniqueIdFuncGen();
		this._opts = opts;
		this.ddpConnection = new DDP(opts);
		this.subs = [];
		this.collections = {};
		this.onChangeFuncs = [];
		this.connected = false;
		this.tryingToConnect = opts.autoConnect === undefined ? true : opts.autoConnect;
		this.tryingToDisconnect = false;
		this.willTryToReconnect = opts.autoReconnect === undefined ? true : opts.autoReconnect;

		//for plugins
		this.dispatchAddedBefore = [];
		this.dispatchAddedAfter = [];

		let pluginConnector = connectPlugins.bind(this,plugins);

		// plugin init section
		pluginConnector('init','beforeConnected');

		this.connectedEvent = this.on('connected',(m)=>{
			this.connected = true;
			this.tryingToConnect = false;
		});

		pluginConnector('afterConnected','beforeSubsRestart');

		this.connectedEventRestartSubs = this.on('connected',(m)=>{
			// we have to clean local collections
			this.clearData();
			// we need to resubscribe to every pub
			this.restartSubsOnConnect();
		});

		pluginConnector('afterSubsRestart','beforeDisconnected');

		this.disconnectedEvent = this.on('disconnected',(m)=>{
			this.connected = false;
			this.tryingToDisconnect = false;
			this.tryingToConnect = this.willTryToReconnect
		});

		pluginConnector('afterDisconnected','beforeAdded');

		this.addedEvent = this.on('added',(m) => this.dispatchAdded(m));
		pluginConnector('afterAdded','beforeChanged');
		this.changedEvent = this.on('changed',(m) => this.dispatchChanged(m));
		pluginConnector('afterChanged','beforeRemoved');
		this.removedEvent = this.on('removed',(m) => this.dispatchRemoved(m));
		pluginConnector('afterRemoved','after');
	}

	restartSubsOnConnect() {
		this.subs.forEach((sub)=>{
			if (sub.isOn()) {
				sub.restart();
			}
		});
	}

	collection(name) {
		return new ddpCollection(name,this);
	}

	dispatchAdded(m) {
		//m везде одинаковое, стоит наверное копировать
		if (this.collections.hasOwnProperty(m.collection)) {
			let i = this.collections[m.collection].findIndex((obj)=>{
				return obj.id == m.id;
			});
			if (i>-1) {
				// новая подписка не знает о старой ровным счетом ничего
				this.collections[m.collection].splice(i,1);
			}
		}
		if (!this.collections.hasOwnProperty(m.collection)) this.collections[m.collection] = [];
		let newObj = Object.assign({id:m.id},m.fields);
		let i = this.collections[m.collection].push(newObj);
		let fields = {};
		if (m.fields) {
			Object.keys(m.fields).map((p)=>{
				fields[p] = 1;
			});
		}
		this.onChangeFuncs.forEach((l)=>{
			if (l.collection==m.collection) {
				let hasFilter = l.hasOwnProperty('filter');
				let newObjFullCopy = fullCopy(newObj);
				if (!hasFilter) {
					l.f({changed:false,added:newObjFullCopy,removed:false});
				} else if (hasFilter && l.filter(newObjFullCopy,i-1,this.collections[m.collection])) {
					l.f({prev:false,next:newObjFullCopy,fields,fieldsChanged:newObjFullCopy,fieldsRemoved:[]});
				}
			}
		});
	}

	dispatchChanged(m) {
		let i = this.collections[m.collection].findIndex((obj)=>{
			return obj.id == m.id;
		});
		if (i>-1) {
			let prev = fullCopy(this.collections[m.collection][i]);
			let fields = {}, fieldsChanged = {}, fieldsRemoved = [];
			if (m.fields) {
				fieldsChanged = m.fields;
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
			let next = this.collections[m.collection][i];
			this.onChangeFuncs.forEach((l)=>{
				if (l.collection==m.collection) {
					// можно в зависимости от l делать полную копию или не делать
					let hasFilter = l.hasOwnProperty('filter');
					if (!hasFilter) {
						l.f({changed:{prev,next:fullCopy(next),fields,fieldsChanged,fieldsRemoved},added:false,removed:false});
					} else {
						let fCopyNext = fullCopy(next);
						let prevFilter = l.filter(prev,i,this.collections[m.collection]);
						let nextFilter = l.filter(fCopyNext,i,this.collections[m.collection]);
						if (prevFilter || nextFilter) {
							l.f({prev,next:fCopyNext,fields,fieldsChanged,fieldsRemoved,predicatePassed:[prevFilter,nextFilter]});
						}
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
			let removedObj = this.collections[m.collection].splice(i,1)[0];
			this.onChangeFuncs.forEach((l)=>{
				if (l.collection==m.collection) {
					let hasFilter = l.hasOwnProperty('filter');
					if (!hasFilter) {
						// возможно стоит сделать fullCopy, чтобы было как в случае dispatchAdded и dispatchChanged
						l.f({changed:false,added:false,removed:removedObj});
					} else {
						if (l.filter(removedObj,i,this.collections[m.collection])) {
							l.f({prev:removedObj,next:false});
						}
					}
				}
			});
		}
	}

	connect() {
		this.willTryToReconnect = this._opts.autoReconnect === undefined ? true : this._opts.autoReconnect;
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
		this.willTryToReconnect = false;
		return new Promise((resolve, reject) => {
			if (!this.tryingToDisconnect) {
				this.ddpConnection.disconnect();
				this.tryingToDisconnect = true;
			}
			if (this.connected) {
				let connectionHandler = this.on('disconnected', () => {
					connectionHandler.stop();
					this.tryingToDisconnect = false;
					resolve();
				});
			} else {
				resolve();
			}
		});
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
			return sub.subname == subname && isEqual(sub.args,Array.isArray(args)?args:[]);
		});
		if (!hasSuchSub) {
			let i = this.subs.push(new ddpSubscription(subname,Array.isArray(args)?args:[],this));
			return this.subs[i-1];
		} else {
			// prehaps the sub can be restarted here just in case
			return hasSuchSub;
		}
	}

	on(event,f) {
		return new ddpEventListener(event,f,this);
	}

	stopChangeListeners() {
		this.onChangeFuncs = [];
	}

	clearData() {
		return new Promise((resolve, reject) => {
			let realCounter = 0;
			let counter = 0;
			let lastMessage = false;

			let uniqueId = this._id+"-"+this._opGenId();

			Object.keys(this.collections).forEach((collection)=>{
				this.collections[collection].forEach((doc)=>{
					const listener = this.on('removed',(m,id)=>{
						if (id == uniqueId) {
							if (counter==realCounter && lastMessage) {
								listener.stop();
								resolve();
							}
							counter++;
						}
					});

					this.ddpConnection.emit('removed',{
						msg: 'removed',
						id: doc.id,
						collection: collection
					}, uniqueId);

					realCounter++;
				});
			});
			lastMessage = true;
		});
	}

	importData(data) {
		return new Promise((resolve, reject) => {
			let c = typeof data === 'string' ? EJSON.parse(data) : data;

			let realCounter = 0;
			let counter = 0;
			let lastMessage = false;

			let uniqueId = this._id+"-"+this._opGenId();

			Object.keys(c).forEach((collection)=>{
				c[collection].forEach((doc)=>{

					let docFields = Object.assign({},doc);
					delete docFields['id'];
					
					const listener = this.on('added',(m,id)=>{
						if (id == uniqueId) {
							if (counter==realCounter && lastMessage) {
								listener.stop();
								resolve();
							}
							counter++;
						}
					});

					this.ddpConnection.emit('added',{
						msg: 'added',
						id: doc.id,
						collection: collection,
						fields: docFields
					}, uniqueId);

					realCounter++;
				});
			});
			lastMessage = true;
		});
	}

	exportData(format) {
		if (format === undefined || format == 'string') {
			return EJSON.stringify(this.collections);
		} else if (format == 'raw') {
			return fullCopy(this.collections);
		}
	}

	markAsReady(subs) {
		return new Promise((resolve, reject) => {
			let uniqueId = this._id+"-"+this._opGenId();

			this.ddpConnection.emit('ready',{
				msg: 'ready',
				subs: subs.map(sub=>sub._getId())
			}, uniqueId);

			const listener = this.on('ready',(m,id)=>{
				if (id == uniqueId) {
					listener.stop();
					resolve();
				}
			});
		});
	}

}
