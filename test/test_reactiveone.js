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

    it('should return reactive object from filtered collection', function () {

      let collectionReactiveObj = server.collection('foe').filter(e=>e.cat=='a').reactiveOne();

      assert.deepEqual(collectionReactiveObj.data,{
        id: 'abc',
        cat: 'a',
        name: 'test',
        age: '1 month',
        quality: 'super'
      });

    });

    it('should change reactive object data to empty object because new object does not pass the filter', function (done) {

      let collectionReactiveObj = server.collection('foe').filter(e=>e.cat=='a').reactiveOne();

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {cat:'b'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        assert.deepEqual(collectionReactiveObj.data,{});
        done();
      },10);
    });

    it('should update the reactive object', function (done) {

      let collectionReactiveObj = server.collection('foe').filter(e=>e.cat=='a').reactiveOne();

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {name:'not test'},
        cleared: [],
        collection: 'foe'
      });

      setTimeout(()=>{
        assert.deepEqual(collectionReactiveObj.data,{
          id: 'abc',
          cat: 'a',
          name: 'not test',
          age: '1 month',
          quality: 'super'
        });
        done();
      },10);
    });


  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
