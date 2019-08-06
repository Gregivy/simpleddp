const assert = require('chai').assert;

const simpleDDP = require('../lib/simpleddp');
const ws = require("ws");

const opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: ws,
    reconnectInterval: 5000,
    clearDataOnReconnection: true
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

  describe('#clearData', function (){

    it('should clearData when `clearDataOnReconnection=true` and only after all `removed` message resubscribe', function (done) {

      let checks = [];

      server.on('added',function () {
        checks.push('added');
      });
      server.on('removed',function () {
        checks.push('removed');
      });

      server.ddpConnection.emit('added',{id:0,collection:'test',fields:{test:0}});
      server.ddpConnection.emit('disconnected');
      server.ddpConnection.emit('connected');
      setTimeout(function(){
        server.ddpConnection.emit('added',{id:0,collection:'test',fields:{test:0}});
          setTimeout(function(){
            assert.deepEqual(checks, ['added','removed','added']);
            done();
          },0);
      },10);

    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
