import { fullCopy } from '../helpers/fullCopy.js';

import { ddpFilter } from './ddpFilter.js';
import { ddpOnChange } from './ddpOnChange.js';

export class ddpCollection {
  constructor(name,server) {
    this.name = name;
    this.server = server;
    this._sort = undefined;
	}

  filter(f) {
    return new ddpFilter(this,f,this._sort);
  }

  fetch() {
    let c = this.server.collections[this.name];
    let collectionCopy = c ? fullCopy(c) : [];
    return this._sort?collectionCopy.sort(this._sort):collectionCopy;
  }

  sort(f) {
    this._sort = f;
    return this;
  }

  reactive() {
    return this.filter((_)=>true).reactive();
  }

  reactiveOne(settings) {
    return this.filter((_)=>true).reactiveOne(settings);
  }

  onChange(f) {
    let obj = {
      collection: this.name,
      f: f
    };

    return new ddpOnChange(obj,this.server);
  }

}
