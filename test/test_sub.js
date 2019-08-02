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

  describe('#sub', function (){

    it('should subscribe and simpleDDP.collections should update', async function () {

      let subscriptionId = "";

      setTimeout(function(){
        server.ddpConnection.emit('added',{
          msg: 'added',
          collection: "test",
          id: '0',
          fields: {isOk:true}
        });

        server.ddpConnection.emit('ready',{
          msg: 'ready',
          subs: [subscriptionId]
        });
      },10);

      let sub = await server.sub("testsub");
      subscriptionId = sub.subscriptionId;

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

    });

    it('should subscribe and simpleDDP.collections should update, await sub ready should work both times', async function () {

      let subscriptionId = "";

      setTimeout(function(){
        server.ddpConnection.emit('added',{
          msg: 'changed',
          collection: "test",
          id: '0',
          fields: {isOk:false}
        });

        server.ddpConnection.emit('ready',{
          msg: 'ready',
          subs: [subscriptionId]
        });
      },10);

      let sub = await server.sub("testsub");
      subscriptionId = sub.subscriptionId;

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

    });

  });

  describe('#subscribe', function (){

    it('has the same functionanly as sub, but different syntax', async function () {

      let subscriptionId = "";

      setTimeout(function(){
        server.ddpConnection.emit('added',{
          msg: 'added',
          collection: "test",
          id: '0',
          fields: {isOk:true}
        });

        server.ddpConnection.emit('ready',{
          msg: 'ready',
          subs: [subscriptionId]
        });
      },10);

      let sub = await server.subscribe("testsub");
      subscriptionId = sub.subscriptionId;

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

    });

    it('check the behavior of starting the subscription if error comes from server', function (done) {

      let subscriptionId = "";

      setTimeout(function(){
        server.ddpConnection.emit('nosub',{id:subscriptionId,error:"test error"});
      },10);

      let sub = server.subscribe("testsub");
      subscriptionId = sub.subscriptionId;

      sub.ready().then(function () {
        assert.fail();
      }).catch(function (error) {
        assert.isNotNull(error)
        done();
      });

    });

  });

  describe('#restart', function (){

    it('check the behavior of restarting the subscription if error comes from server', function (done) {

      let subscriptionId = "";

      setTimeout(function(){
        server.ddpConnection.emit('ready',{
          msg: 'ready',
          subs: [subscriptionId]
        });
      },10);

      let sub = server.subscribe("testsub");
      subscriptionId = sub.subscriptionId;

      sub.ready().then(function () {
        console.log('ready');
        setTimeout(function(){
          server.ddpConnection.emit('nosub',{id:subscriptionId,error:"test error"});
        },10);
        sub.restart().then(function () {
          assert.fail();
        }).catch(function (error) {
          assert.isNotNull(error)
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
