const assert = require('chai').assert;

const simpleDDP = require('../lib/simpleddp');
const ws = require("ws");

const opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: ws,
    reconnectInterval: 5000
};

describe('simpleDDP', function(){
  let server = new simpleDDP(opts);

  describe('#collection->fetch', function (){

    beforeEach(function() {
      // runs before each test in this block
      // turn the default collection to the initial state
      server.collections['foe'] = [{
        id: 'abc',
        name: 'test',
        age: '1 month',
        quality: 'super'
      },{
        id: 'def',
        name: 'striker',
        age: '100 years',
        quality: 'medium'
      },{
        id: 'ghi',
        name: 'unusual',
        why: 'because'
      }];

      //remove onChange handlers
      server.onChangeFuncs = [];
    });

    it('should return filtered collection', function () {

      let collectionCut = server.collection('foe').filter((e,i,c)=>{
        return e.id == 'abc' || e.quality;
      }).fetch();

      assert.deepEqual(collectionCut,[{
        id: 'abc',
        name: 'test',
        age: '1 month',
        quality: 'super'
      },{
        id: 'def',
        name: 'striker',
        age: '100 years',
        quality: 'medium'
      }]);

    });

    it('should return [] because no such collection', function () {

      let collectionCut = server.collection('abc').fetch();

      assert.deepEqual(collectionCut,[]);

    });

    it('should return [] because no such collection', function () {

      let collectionCut = server.collection('abc').filter((e,i,c)=>{
        return e.id == 'abc' || e.quality;
      }).fetch();

      assert.deepEqual(collectionCut,[]);

    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
