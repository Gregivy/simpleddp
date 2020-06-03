import { fullCopy } from '../helpers/fullCopy.js';
import { ddpOnChange } from './ddpOnChange.js';
import { ddpReactiveCollection } from './ddpReactiveCollection.js';

/**
 * DDP collection class.
 * @constructor
 * @param {String} name - Collection name.
 * @param {simpleDDP} server - simpleDDP instance.
 */

export class ddpCollection {
  constructor(name,server) {
    this._name = name;
    this._server = server;
    this._filter = false;
	}

  /**
   * Allows to specify specific documents inside the collection for reactive data and fetching.
   * Important: if you change filter function it won't change for the already created reactive objects.
   * @public
   * @param {Function} f - Filter function, recieves as arguments object, index and array.
   * @return {this}
   */
  filter(f) {
    this._filter = f;
    return this;
  }

  /**
   * Imports data inside the collection and emits all relevant events.
   * Both string and JS object types are supported.
   * @public
   * @param {string|Object} data - EJSON string or EJSON or js object.
   */
  importData(data) {
		let c = typeof data === 'string' ? EJSON.parse(data) : data;

		if (c[this._name]) {
      c[this._name].forEach((doc,i,arr)=>{
        if (!this._filter || (this._filter && this._filter(doc,i,arr))) {
  				this.ddpConnection.emit('added',{
  					msg: 'added',
  					id: doc.id,
  					collection: this._name,
  					fields: doc.fields
  				});
        }
      });
    }
	}

  /**
   * Exports data from the collection.
   * @public
   * @param {string} [format='string'] - If 'string' then returns EJSON string, if 'raw' returns js object.
   * @return {string|Object}
   */
  exportData(format) {
    let collectionCopy = {[this._name]:this.fetch()};
    if (format === undefined || format == 'string') {
			return EJSON.stringify(collectionCopy);
		} else if (format == 'raw') {
			return collectionCopy;
		}
  }

  /**
   * Returns collection data based on filter and on passed settings. Supports skip, limit and sort.
   * Order is 'filter' then 'sort' then 'skip' then 'limit'.
   * @public
   * @param {Object} [settings={skip:0,limit:Infinity,sort:null}] - Skip and limit are numbers or Infinity,
   * sort is a standard js array sort function.
   * @return {Object}
   */
  fetch(settings) {
    let skip, limit, sort;

    if (settings) {
      skip = settings.skip;
      limit = settings.limit;
      sort = settings.sort;
    }

    let c = this._server.collections[this._name];
    let collectionCopy = c ? fullCopy(c) : [];
    if (this._filter) collectionCopy = collectionCopy.filter(this._filter);
    if (sort) collectionCopy.sort(sort);
    if (typeof skip === 'number') collectionCopy.splice(0,skip);
    if (typeof limit === 'number' || limit == Infinity) collectionCopy.splice(limit);
    return collectionCopy;
  }

  /**
   * Returns reactive collection object.
   * @see ddpReactiveCollection
   * @public
   * @param {Object} [settings={skip:0,limit:Infinity,sort:null}]
   * @return {Object} - @see ddpReactiveCollection
   */
  reactive(settings) {
    return new ddpReactiveCollection(this,settings,this._filter);
  }

  /**
   * Returns change observer.
   * @see ddpOnChange
   * @public
   * @param {Function} f
   * @param {Function} filter
   * @return {Object} - @see ddpOnChange
   */
  onChange(f,filter) {
    let obj = {
      collection: this._name,
      f: f
    };

    if (this._filter) obj.filter = this._filter;
    if (filter) obj.filter = filter;

    return new ddpOnChange(obj,this._server);
  }

}
