import { fullCopy } from '../helpers/fullCopy.js';

import { ddpOnChange } from './ddpOnChange.js';
import { ddpReactiveCollection } from './ddpReactiveCollection.js';
import { ddpReactiveObject } from './ddpReactiveObject.js';

export class ddpCollection {
  constructor(name,server) {
    this.name = name;
    this.server = server;
    this._filter = false;
	}

  filter(f) {
    //return new ddpFilter(this,f);
    this._filter = f;
    return this;
  }

  importData(data) {
		let c = typeof data === 'string' ? EJSON.parse(data) : data;

		if (c[this.name]) {
      c[this.name].forEach((doc,i,arr)=>{
        if (!this._filter || (this._filter && this._filter(doc,i,arr))) {
  				this.ddpConnection.emit('added',{
  					msg: 'added',
  					id: doc.id,
  					collection: this.name,
  					fields: doc.fields
  				});
        }
      });
    }
	}

  exportData(format) {
    let collectionCopy = {[this.name]:this.fetch()};
    if (format === undefined || format == 'string') {
			return EJSON.stringify(collectionCopy);
		} else if (format == 'raw') {
			return collectionCopy;
		}
  }

  fetch(settings) {
    let skip, limit, sort;

    if (settings) {
      skip = settings.skip;
      limit = settings.limit;
      sort = settings.sort;
    }

    let c = this.server.collections[this.name];
    let collectionCopy = c ? fullCopy(c) : [];
    if (this._filter) collectionCopy = collectionCopy.filter(this._filter);
    if (sort) collectionCopy.sort(sort);
    if (typeof skip === 'number') collectionCopy.splice(0,skip);
    if (typeof limit === 'number' || limit == Infinity) collectionCopy.splice(limit);
    return collectionCopy;
  }

  reactive(settings) {
    return new ddpReactiveCollection(this,settings,this._filter);
  }

  onChange(f,filter) {
    let obj = {
      collection: this.name,
      f: f
    };

    if (this._filter) obj.filter = this._filter;
    if (filter) obj.filter = filter;

    return new ddpOnChange(obj,this.server);
  }

}
