const assert = require('chai').assert;

const simpleDDP = require('../lib/simpleddp').default;
const ws = require("ws");

const opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: ws,
    reconnectInterval: 5000
};

describe('simpleDDP', function(){
  let server = new simpleDDP(opts);

  describe('#collection->reactive', function (){

    beforeEach(function() {
      // runs before each test in this block
      // turn the default collection to the initial state
      server.collections['foe'] = [{
        id: 'abc',
        cat: 'a',
        name: 'test',
        age: '1 month',
        quality: 'super'
      },{
        id: 'def',
        cat: 'a',
        name: 'striker',
        age: '100 years',
        quality: 'medium'
      },{
        id: 'ghi',
        cat: 'b',
        name: 'victory',
        why: 'because'
      },{
        id: 'plu',
        cat: 'a',
        name: 'unusual',
        why: 'because'
      }];

      //remove onChange handlers
      server.onChangeFuncs = [];
    });

    it('should return reactive filtered collection', function () {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      assert.deepEqual(collectionReactiveCut.data,[{
        id: 'abc',
        cat: 'a',
        name: 'test',
        age: '1 month',
        quality: 'super'
      },{
        id: 'def',
        cat: 'a',
        name: 'striker',
        age: '100 years',
        quality: 'medium'
      },{
        id: 'plu',
        cat: 'a',
        name: 'unusual',
        why: 'because'
      }]);

    });

    it('should return sorted reactive filtered collection', function () {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      collectionReactiveCut.sort((a,b)=>{
        if (a.name <= b.name) {
          return -1;
        } else {
          return 1;
        }
      });

      assert.deepEqual(collectionReactiveCut.data,[{
        id: 'def',
        cat: 'a',
        name: 'striker',
        age: '100 years',
        quality: 'medium'
      },{
        id: 'abc',
        cat: 'a',
        name: 'test',
        age: '1 month',
        quality: 'super'
      },{
        id: 'plu',
        cat: 'a',
        name: 'unusual',
        why: 'because'
      }]);

    });

    it('should reactively remove element from filtered collection cut when element changes', function (done) {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      let collectionLength1 = collectionReactiveCut.data.length;

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {cat:'b'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        let collectionLength2 = collectionReactiveCut.data.length;
        assert.equal(collectionLength1,3);
        assert.equal(collectionLength2,2);
        done();
      },50);

    });

    it('should reactively remove element from filtered collection cut when element is removed', function (done) {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      let collectionLength1 = collectionReactiveCut.data.length;

      server.ddpConnection.emit('removed',{
        msg: 'removed',
        id: 'abc',
        collection: 'foe'
      });

      setTimeout(()=>{
        let collectionLength2 = collectionReactiveCut.data.length;
        assert.equal(collectionLength1,3);
        assert.equal(collectionLength2,2);
        done();
      },50);

    });

    it('should reactively add element to filtered collection cut when element changes', function (done) {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      let collectionLength1 = collectionReactiveCut.data.length;

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'ghi',
        fields: {cat:'a'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        let collectionLength2 = collectionReactiveCut.data.length;
        assert.equal(collectionLength1,3);
        assert.equal(collectionLength2,4);
        done();
      },50);

    });

    it('should reactively add element to filtered collection cut when element is added', function (done) {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      let collectionLength1 = collectionReactiveCut.data.length;

      server.ddpConnection.emit('added',{
        msg: 'added',
        id: 'new',
        fields: {cat:'a',name:'newElement'},
        collection: 'foe'
      });

      setTimeout(()=>{
        let collectionLength2 = collectionReactiveCut.data.length;
        assert.equal(collectionLength1,3);
        assert.equal(collectionLength2,4);
        done();
      },50);

    });

    it('should reactively re-sort filtered collection cut when element changes', function (done) {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      collectionReactiveCut.sort((a,b)=>{
        if (a.name <= b.name) {
          return -1;
        } else {
          return 1;
        }
      });

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {name:'prime'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        assert.deepEqual(collectionReactiveCut.data,[{
          id: 'abc',
          cat: 'a',
          name: 'prime',
          age: '1 month',
          quality: 'super'
        },{
          id: 'def',
          cat: 'a',
          name: 'striker',
          age: '100 years',
          quality: 'medium'
        },{
          id: 'plu',
          cat: 'a',
          name: 'unusual',
          why: 'because'
        }]);
        done();
      },50);

    });

    it('should reactively re-sort filtered collection cut when element added to filtered cut by being changed', function (done) {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      collectionReactiveCut.sort((a,b)=>{
        if (a.name <= b.name) {
          return -1;
        } else {
          return 1;
        }
      });

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'ghi',
        fields: {cat:'a'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        assert.deepEqual(collectionReactiveCut.data,[{
          id: 'def',
          cat: 'a',
          name: 'striker',
          age: '100 years',
          quality: 'medium'
        },{
          id: 'abc',
          cat: 'a',
          name: 'test',
          age: '1 month',
          quality: 'super'
        },{
          id: 'plu',
          cat: 'a',
          name: 'unusual',
          why: 'because'
        },{
          id: 'ghi',
          cat: 'a',
          name: 'victory',
          why: 'because'
        }]);
        done();
      },50);

    });

    it('should reactively re-sort filtered collection cut when element added to filtered cut by being added', function (done) {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      collectionReactiveCut.sort((a,b)=>{
        if (a.name <= b.name) {
          return -1;
        } else {
          return 1;
        }
      });

      server.ddpConnection.emit('added',{
        msg: 'added',
        id: 'new',
        fields: {cat:'a', name:'tast'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        assert.deepEqual(collectionReactiveCut.data,[{
          id: 'def',
          cat: 'a',
          name: 'striker',
          age: '100 years',
          quality: 'medium'
        },{
          id: 'new',
          cat: 'a',
          name: 'tast',
        },{
          id: 'abc',
          cat: 'a',
          name: 'test',
          age: '1 month',
          quality: 'super'
        },{
          id: 'plu',
          cat: 'a',
          name: 'unusual',
          why: 'because'
        }]);
        done();
      },50);

    });

    it('should not add to reactive collection an object that does not pass the filter', function (done) {

      let collectionReactiveCut = server.collection('foe').filter(e=>e.cat=='a').reactive();

      server.ddpConnection.emit('added',{
        msg: 'added',
        id: 'new',
        fields: {cat:'b', name:'tast'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        assert.deepEqual(collectionReactiveCut.data,[{
          id: 'abc',
          cat: 'a',
          name: 'test',
          age: '1 month',
          quality: 'super'
        },{
          id: 'def',
          cat: 'a',
          name: 'striker',
          age: '100 years',
          quality: 'medium'
        },{
          id: 'plu',
          cat: 'a',
          name: 'unusual',
          why: 'because'
        }]);
        done();
      },50);

    });

    it('should add to reactive collection an object', function (done) {

      let collectionReactiveCut = server.collection('foe').reactive();

      server.ddpConnection.emit('added',{
        msg: 'added',
        id: 'new',
        fields: {cat:'b', name:'tast'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        assert.deepEqual(collectionReactiveCut.data,[{
          id: 'abc',
          cat: 'a',
          name: 'test',
          age: '1 month',
          quality: 'super'
        },{
          id: 'def',
          cat: 'a',
          name: 'striker',
          age: '100 years',
          quality: 'medium'
        },{
          id: 'ghi',
          cat: 'b',
          name: 'victory',
          why: 'because'
        },{
          id: 'plu',
          cat: 'a',
          name: 'unusual',
          why: 'because'
        },{
          id: 'new',
          cat: 'b',
          name: 'tast'
        }]);
        done();
      },50);

    });

    it('should add to reactive collection an object and re-sort', function (done) {

      let collectionReactiveCut = server.collection('foe').reactive();

      collectionReactiveCut.sort((a,b)=>{
        if (a.name <= b.name) {
          return -1;
        } else {
          return 1;
        }
      });

      server.ddpConnection.emit('added',{
        msg: 'added',
        id: 'new',
        fields: {cat:'b', name:'tast'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        assert.deepEqual(collectionReactiveCut.data,[{
          id: 'def',
          cat: 'a',
          name: 'striker',
          age: '100 years',
          quality: 'medium'
        },{
          id: 'new',
          cat: 'b',
          name: 'tast'
        },{
          id: 'abc',
          cat: 'a',
          name: 'test',
          age: '1 month',
          quality: 'super'
        },{
          id: 'plu',
          cat: 'a',
          name: 'unusual',
          why: 'because'
        },{
          id: 'ghi',
          cat: 'b',
          name: 'victory',
          why: 'because'
        }]);
        done();
      },50);

    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
