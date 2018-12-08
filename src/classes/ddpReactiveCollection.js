import { ddpReducer } from './ddpReducer.js';
import { ddpReactiveDocument } from './ddpReactiveDocument.js';

/**
 * A reactive collection class.
 * @constructor
 * @param {ddpCollection} ddpCollection - Instance of ddpCollection class.
 * @param {Object} [skiplimit={skip:0,limit:Infinity}] - Object for declarative reactive collection slicing.
 */

export class ddpReactiveCollection {
	constructor(ddpCollectionInstance,skiplimit,filter) {
    this._skip = skiplimit && typeof skiplimit.skip === 'number' ? skiplimit.skip : 0;
    this._limit = skiplimit && typeof skiplimit.limit === 'number' ? skiplimit.limit : Infinity;

    this._length = {result:0};

    this._data = [];
    this._rawData = [];

    this._reducers = [];
    this._ones = [];

    this._first = {};

    this._syncFunc = function (skip,limit,sort) {
      let options = {};
      if (typeof skip === 'number') options.skip = skip;
      if (typeof limit === 'number') options.limit = limit;
      if (sort) options.sort = sort;
      return ddpCollectionInstance.fetch.call(ddpCollectionInstance,options);
    };

    this._changeHandler = ddpCollectionInstance.onChange(({prev,next,predicatePassed})=>{
      if (prev && next) {
        if (predicatePassed[0]==0 && predicatePassed[1]==1) {
          // prev falling, next passing filter, adding new element with sort
          this._smartUpdate(next);
        } else if (predicatePassed[0]==1 && predicatePassed[1]==0) {
          // prev passing, next falling filter, removing old element
          let i = this._rawData.findIndex((obj)=>{
      			return obj.id == prev.id;
      		});
          this._removeItem(i);
        } else if (predicatePassed[0]==1 && predicatePassed[1]==1) {
          // both passing, should delete previous and add new
          let i = this._rawData.findIndex((obj)=>{
      			return obj.id == prev.id;
      		});
          this._smartUpdate(next,i);
        }
      } else if (!prev && next) {
        // element was added and is passing the filter
        // adding new element with sort
        this._smartUpdate(next);
      } else if (prev && !next) {
        // element was removed and is passing the filter, so it was in newCollection
        // removing old element
        let i = this._rawData.findIndex((obj)=>{
          return obj.id == prev.id;
        });
         this._removeItem(i);
      }
      this._length.result = this._data.length;

      this._reducers.forEach((reducer)=>{
        reducer.doReduce();
      });

      if (this._data[0]!==this._first) {
        this._updateReactiveObjects();
      }

      this._first = this._data[0];
    },filter?filter:(_)=>true);

    this.started = false;
    this._sort = false;

    this.start();
	}

  /**
   * Removes document from local collection copies.
   * @private
   * @param {number} i - Document index in this._rawData array.
   */
  _removeItem(i) {
    this._rawData.splice(i,1);

    if (i >= this._skip && i<this._skip+this._limit) {
      this._data.splice(i-this._skip,1);

      if (this._rawData.length>=this._skip+this._limit) {
        this._data.push(this._rawData[this._skip+this._limit-1]);
      }
    } else if (i<this._skip) {
      this._data.shift();
      if (this._rawData.length>=this._skip+this._limit) {
        this._data.push(this._rawData[this._skip+this._limit-1]);
      }
    }

  }

  /**
   * Adds document to local the collection this._rawData according to used sorting if specified.
   * @private
   * @param {Object} newEl - Document to be added to the local collection.
   * @return {boolean} - The first element in the collection was changed
   */
  _smartUpdate(newEl,j) {
    let placement;
    if (this._sort) {
      for (let i=0;i<this._rawData.length;i++) {
        if (this._sort(newEl,this._rawData[i])<1) {
          placement = i;
          if (i==j) {
            // new position is the the same
            this._rawData[i] = newEl;
						if (j>=this._skip && j<this._skip+this._limit) {
							this._data[j-this._skip] = newEl;
						}
          } else {
            // new position is different
            // removing old element and adding new
            this._removeItem(j);
            this._rawData.splice(i,0,newEl);
						if (i>=this._skip && i<this._skip+this._limit) {
							this._data.splice(i-this._skip,0,newEl);
							this._data.splice(this._limit);
						}
          }
          break;
        }
        if (i==this._rawData.length-1) {
          placement = this._rawData.push(newEl) - 1;
					if (placement>=this._skip && placement<this._skip+this._limit) {
						this._data.push(newEl);
					}
          break;
        }
      }
    } else {
      // no sorting, trying to change existing
      if (typeof j === 'number') {
        placement = j;
        this._rawData[j] = newEl;
				if (j>=this._skip && j<this._skip+this._limit) {
					this._data[j-this._skip] = newEl;
				}
      } else {
        placement = this._rawData.push(newEl) - 1;
				if (placement>=this._skip && placement<this._skip+this._limit) {
					this._data.push(newEl);
				}
      }
    }

  }

  /**
   * Adds reducer.
   * @private
   * @param {ddpReducer} reducer - A ddpReducer object that needs to be updated on changes.
   */
  _activateReducer(reducer) {
    this._reducers.push(reducer);
  }

  /**
   * Adds reactive object.
   * @private
   * @param {ddpReactiveDocument} o - A ddpReactiveDocument object that needs to be updated on changes.
   */
  _activateReactiveObject(o) {
    this._ones.push(o);
  }

  /**
   * Removes reducer.
   * @private
   * @param {ddpReducer} reducer - A ddpReducer object that does not need to be updated on changes.
   */
  _deactivateReducer(reducer) {
    let i = this._reducers.indexOf(reducer);
    if (i>-1) {
      this._reducers.splice(i,1);
    }
  }

  /**
   * Removes reactive object.
   * @private
   * @param {ddpReactiveDocument} o - A ddpReducer object that does not need to be updated on changes.
   */
  _deactivateReactiveObject(o) {
    let i = this._ones.indexOf(o);
    if (i>-1) {
      this._ones.splice(i,1);
    }
  }

  /**
   * Sends new object state for every associated reactive object.
   * @public
   */
  _updateReactiveObjects() {
    this._ones.forEach((ro)=>{
      ro._update(this.data()[0]);
    });
  }

  /**
   * Update ddpReactiveCollection settings.
   * @public
   * @param {Object} [skiplimit={skip:0,limit:Infinity}] - Object for declarative reactive collection slicing.
   */
  settings({skip,limit}) {
    this._skip = skip !== false ? skip : 0;
    this._limit = limit !== false ? limit : Infinity;
    this._data.splice(0,this._data.length,...this._syncFunc(this._skip,this._limit,this._sort));
    this._updateReactiveObjects();
  }

  /**
   * Stops reactivity. Also stops associated reactive objects.
   * @public
   */
  stop() {
		if (this.started) {
			this._changeHandler.stop();
			this.started = false;
		}
	}


  /**
   * Start reactivity. This method is being called on instance creation.
   * Also starts every associated reactive object.
   * @public
   */
	start() {
		if (!this.started) {
      this._rawData.splice(0,this._rawData.length,...this._syncFunc(false,false,this._sort));
      this._data.splice(0,this._data.length,...this._syncFunc(this._skip,this._limit,this._sort));
      this._updateReactiveObjects();
			this._changeHandler.start();
			this.started = true;
		}
	}

  /**
   * Sorts local collection according to specified function.
   * Specified function form {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort}.
   * @public
   * @param {Function} f - A function used for sorting.
   * @return {this}
   */
  sort(f) {
    this._sort = f;
    if (this._sort) {
      this._rawData.splice(0,this._rawData.length,...this._syncFunc(false,false,this._sort));
      this._data.splice(0,this._data.length,...this._syncFunc(this._skip,this._limit,this._sort));
      this._updateReactiveObjects();
    }
    return this;
  }

  /**
   * Returns reactive local collection with applied sorting, skip and limit.
   * This returned array is being mutated within this class instance.
   * @public
   * @return {Array} - Local collection with applied sorting, skip and limit.
   */
  data() {
    return this._data;
  }

  /**
   * Maps reactive local collection to another reactive array.
   * Specified function form {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map}.
   * @public
   * @param {Function} f - Function that produces an element of the new Array.
   * @return {ddpReducer} - Object that allows to get reactive mapped data @see ddpReducer.
   */
  map(f) {
    return new ddpReducer(this,function (accumulator,el,i,a) {
      return accumulator.concat(f(el,i,a));
    },[]);
  }

  /**
   * Reduces reactive local collection.
   * Specified function form {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce}.
   * @public
   * @param {Function} f - Function to execute on each element in the array.
   * @param {*} initialValue - Value to use as the first argument to the first call of the function.
   * @return {ddpReducer} - Object that allows to get reactive object based on reduced reactive local collection @see ddpReducer.
   */
  reduce(f,initialValue) {
    return new ddpReducer(this,f,initialValue);
  }

  /**
   * Reactive length of the local collection.
   * @public
   * @return {Object} - Object with reactive length of the local collection. {result}
   */
  count() {
    return this._length;
  }

  /**
   * Returns a reactive object which fields are always the same as the first object in the collection.
   * @public
   * @param {Object} [settings={preserve:false}] - Settings for reactive object. Use {preserve:true} if you want to keep object on remove.
   * @return {ddpReactiveDocument} - Object that allows to get reactive object based on reduced reactive local collection @see ddpReactiveDocument.
   */
  one(settings) {
    return new ddpReactiveDocument(this,settings);
  }

}
