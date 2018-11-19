import { ddpReactiveCollection } from './ddpReactiveCollection.js';
import { ddpReactiveObject } from './ddpReactiveObject.js';
import { ddpOnChange } from './ddpOnChange.js';

export class ddpFilter {
  constructor(ddpCollectionInstance,f,sort) {
    this.server = ddpCollectionInstance.server;
    this.collection = ddpCollectionInstance.name;
    this.ddpCollectionFetch = function () {
      return ddpCollectionInstance.fetch.call(ddpCollectionInstance);
    };
    this.f = f;
    this._sort = sort;
    this.reactiveFetchListener;
	}

  sort(f) {
    this._sort = f;
    return this;
  }

  fetch() {
    let fetched = this.ddpCollectionFetch().filter(this.f);
    return this._sort?fetched.sort(this._sort):fetched;
  }

  reactive() {
    let newCollection = this.fetch();

    let reactiveSource = new ddpReactiveCollection(newCollection,this);

    this.reactiveFetchListener = this.onChange(({prev,next,predicatePassed})=>{
      if (prev && next) {
        if (predicatePassed[0]==0 && predicatePassed[1]==1) {
          // prev falling, next passing filter, adding new element with sort
          reactiveSource.sortUpdate(next);
        } else if (predicatePassed[0]==1 && predicatePassed[1]==0) {
          // prev passing, next falling filter, removing old element
          let i = newCollection.findIndex((obj)=>{
      			return obj.id == prev.id;
      		});
          newCollection.splice(i,1);
        } else if (predicatePassed[0]==1 && predicatePassed[1]==1) {
          // both passing, should delete previous and add new
          let i = newCollection.findIndex((obj)=>{
      			return obj.id == prev.id;
      		});
          newCollection.splice(i,1);
          reactiveSource.sortUpdate(next);
        }
      } else if (!prev && next) {
        // element was added and is passing the filter
        // adding new element with sort
        reactiveSource.sortUpdate(next);
      } else if (prev && !next) {
        // element was removed and is passing the filter, so it was in newCollection
        // removing old element
        let i = newCollection.findIndex((obj)=>{
          return obj.id == prev.id;
        });
        newCollection.splice(i,1);
      }
    });

    reactiveSource.setChangeHandler(this.reactiveFetchListener);

    return reactiveSource;
  }

  reactiveOne(settings) {
    let syncedData = this.fetch();
    let newObject = syncedData[0]?syncedData[0]:{};

    let reactiveSource = new ddpReactiveObject(newObject,this,settings);

    this.reactiveFetchListener = this.onChange(({prev,next,fieldsRemoved,predicatePassed})=>{
      if (prev && next) {
        if (predicatePassed[0]==1 && predicatePassed[1]==0) {
          reactiveSource.update(false,prev);
        } else {
          reactiveSource.update(next,prev,fieldsRemoved);
        }
      } else {
        reactiveSource.update(next,prev,fieldsRemoved);
      }
    });

    reactiveSource.setChangeHandler(this.reactiveFetchListener);

    return reactiveSource;
  }

  onChange(f) {
    let obj = {
      collection: this.collection,
      filter: this.f,
      f: f
    };

    return new ddpOnChange(obj,this.server);
  }
}
