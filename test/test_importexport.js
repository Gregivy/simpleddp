const assert = require('chai').assert;

const simpleDDP = require('../lib/simpleddp').default;
const ws = require("ws");
const EJSON = require("ejson");

const opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: ws,
    reconnectInterval: 5000
};

let onListener = null;

describe('simpleDDP', function(){
  let server = new simpleDDP(opts);

  describe('#collection->importData', function (){

    beforeEach(function() {
      // runs before each test in this block
      // turn the default collection to the initial state
      server.collections = {};

    });

    it('should import raw data into storage', function (done) {

      let data = {
        foe: [{
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
        }],
        bar: [{
          id: 'ghi',
          cat: 'b',
          name: 'victory',
          why: 'because'
        },{
          id: 'plu',
          cat: 'a',
          name: 'unusual',
          why: 'because'
        }]
      };

      server.importData(data).then(function() {
        assert.deepEqual(server.collections,data);
        done();
      });
    });

    it('should import string data into storage', function (done) {

      let dataRaw = {
        foe: [{
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
        }],
        bar: [{
          id: 'ghi',
          cat: 'b',
          name: 'victory',
          why: 'because'
        },{
          id: 'plu',
          cat: 'a',
          name: 'unusual',
          why: 'because'
        }]
      };

      dataJSON = EJSON.stringify(dataRaw);

      server.importData(dataJSON).then(function() {
        assert.deepEqual(server.collections,dataRaw);
        done();
      });

    });

  });

  describe('#collection->exportData', function (){

    const data = {
      foe: [{
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
      }],
      bar: [{
        id: 'ghi',
        cat: 'b',
        name: 'victory',
        why: 'because'
      },{
        id: 'plu',
        cat: 'a',
        name: 'unusual',
        why: 'because'
      }]
    };

    before(function() {
      server.collections = data;

    });

    it('should export raw data from the storage', function () {

      let exported = server.exportData('raw');

      assert.deepEqual(exported,data);

    });

    it('should export EJSON data from the storage', function () {

      let exported = EJSON.parse(server.exportData());

      assert.deepEqual(exported,data);

    });

  });

  describe('#collection->markAsReady', function (){
    let emulSub;

    after(function() {
      // runs after every test in this block
      emulSub.stop();
      emulSub = undefined;
    });

    it('should emulate subscription readiness', function (done) {

      emulSub = server.sub('testsub');
      emulSub.ready().then(done);
      server.markAsReady([emulSub]);

    });

  });

  describe('#collection->clearData', function (){

    const data = {
      foe: [{
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
      }],
      bar: [{
        id: 'ghi',
        cat: 'b',
        name: 'victory',
        why: 'because'
      },{
        id: 'plu',
        cat: 'a',
        name: 'unusual',
        why: 'because'
      }]
    };

    after(function() {
      //server.collections = {};
    });

    it('should clear all collections data', function (done) {

      server.importData(data).then(function () {
        assert.deepEqual(server.collections,data);
        server.clearData().then(function() {
          assert.deepEqual(server.collections,{ foe: [], bar: [] });
          done();
        });
      });

    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
