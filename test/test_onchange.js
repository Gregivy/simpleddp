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

  describe('#onChange', function (){
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

    it('should detect adding doc to the collection', function (done) {

      server.collection('foe').onChange(function ({added,removed,changed}) {
        assert.deepEqual(added, {id: 'nby', name:'new boy', age:'1 minute'});
        done();
      });

      server.ddpConnection.emit('added',{
        msg: 'added',
        id: 'nby',
        fields: {name:'new boy', age:'1 minute'},
        collection: 'foe'
      });

    });

    it('should detect changing doc in the collection', function (done) {

      server.collection('foe').onChange(function ({added,removed,changed}) {
        assert.deepEqual(changed, {
          prev: {
            id: 'abc',
            name: 'test',
            age: '1 month',
            quality: 'super'
          },
          next: {
            id: 'abc',
            name: 'new boy',
            quality: 'medium'
          },
          fields: {
            name: 1,
            quality: 1,
            age: 0
          },
          fieldsChanged: {
            name: 'new boy',
            quality: 'medium'
          },
          fieldsRemoved: ['age']
        });
        done();
      });

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {name:'new boy', quality:'medium'},
        cleared: ['age'],
        collection: 'foe'
      });

    });

    it('should detect removing doc from the collection', function (done) {

      server.collection('foe').onChange(function ({added,removed,changed}) {
        assert.deepEqual(removed, {
          id: 'abc',
          name: 'test',
          age: '1 month',
          quality: 'super'
        });
        done();
      });

      server.ddpConnection.emit('removed',{
        msg: 'removed',
        id: 'abc',
        collection: 'foe'
      });

    });

    it('should detect changing the doc', function (done) {

      server.collection('foe').filter((e,i,c)=>i==0).onChange(function (st) {
        assert.deepEqual(st, {
          prev: {
            id: 'abc',
            name: 'test',
            age: '1 month',
            quality: 'super'
          },
          next: {
            id: 'abc',
            name: 'new boy',
            quality: 'medium'
          },
          fields: {
            name: 1,
            quality: 1,
            age: 0
          },
          fieldsChanged: {
            name: 'new boy',
            quality: 'medium'
          },
          fieldsRemoved: ['age'],
          predicatePassed: [true,true]
        });
        done();
      });

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {name:'new boy', quality:'medium'},
        cleared: ['age'],
        collection: 'foe'
      });

    });

    it('should detect removing the doc', function (done) {

      server.collection('foe').filter((e,i,c)=>i==0).onChange(function ({prev,next,fields,fieldsChanged,fieldsRemoved}) {
        assert.deepEqual(prev, {
          id: 'abc',
          name: 'test',
          age: '1 month',
          quality: 'super'
        });
        assert.isNotOk(next);
        done();
      });

      server.ddpConnection.emit('removed',{
        msg: 'removed',
        id: 'abc',
        collection: 'foe'
      });

    });

    it('should detect changing the doc\'s properties', function (done) {

      server.collection('foe').filter((e,i,c)=>i==0).onChange(function (st) {
        if ('name' in st.fields) {
          assert.strictEqual(st.prev.name, 'test');
          assert.strictEqual(st.next.name, 'new boy');
          done();
        }
      });

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {name:'new boy', quality:'medium'},
        cleared: ['age'],
        collection: 'foe'
      });

    });

    it('should NOT detect changing other doc\'s properties', function (done) {

      server.collection('foe').filter((e,i,c)=>i==0).onChange(function ({fields}) {
        if ('name' in fields) {
          done(new Error());
        }
      });

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {quality:'medium'},
        cleared: ['age'],
        collection: 'foe'
      });

      setTimeout(done, 10);

    });

    it('should NOT detect changing doc\'s properties because stopped and then should detect after rerun', function (done) {

      let trg = true;

      let handler = server.collection('foe').filter((e,i,c)=>i==0).onChange(function ({prev,next}) {
        if (trg) {
          done(new Error());
        } else if (prev.quality=='medium' && next.quality=='normal') {
          done();
        }
      });

      handler.stop();

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {quality:'medium'},
        cleared: ['age'],
        collection: 'foe'
      });
      setTimeout(()=>{
        trg = false;
        handler.start();
        server.ddpConnection.emit('changed',{
          msg: 'changed',
          id: 'abc',
          fields: {quality:'normal'},
          cleared: [],
          collection: 'foe'
        });
      },10);
    });

    it('should NOT detect changing doc\'s properties because stopped and then should detect after rerun', function (done) {

      let trg = true;

      let handler = server.collection('foe').filter((e,i,c)=>i==0).onChange(function ({prev,next}) {
        if (trg) {
          done(new Error());
        } else if (prev.quality=='medium' && next.quality=='normal') {
          done();
        }
      });

      handler.stop();

      server.ddpConnection.emit('changed',{
        msg: 'changed',
        id: 'abc',
        fields: {quality:'medium'},
        cleared: ['age'],
        collection: 'foe'
      });
      setTimeout(()=>{
        trg = false;
        handler.start();
        server.ddpConnection.emit('changed',{
          msg: 'changed',
          id: 'abc',
          fields: {quality:'normal'},
          cleared: [],
          collection: 'foe'
        });
      },50);
    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
