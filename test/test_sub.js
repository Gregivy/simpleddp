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

<<<<<<< HEAD
      let subid = "";
=======
      let subscriptionId = "";
>>>>>>> 2.x.x

      setTimeout(function(){
        server.ddpConnection.emit('added',{
          msg: 'added',
          collection: "test",
          id: '0',
          fields: {isOk:true}
        });

        server.ddpConnection.emit('ready',{
          msg: 'ready',
<<<<<<< HEAD
          subs: [subid]
        });
      },50);

      let sub = await server.sub("testsub");
      subid = sub.subid;
=======
          subs: [subscriptionId]
        });
      },10);

      let sub = await server.sub("testsub");
      subscriptionId = sub.subscriptionId;
>>>>>>> 2.x.x

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

    });

    it('should subscribe and simpleDDP.collections should update, await sub ready should work both times', async function () {

<<<<<<< HEAD
      let subid = "";
=======
      let subscriptionId = "";
>>>>>>> 2.x.x

      setTimeout(function(){
        server.ddpConnection.emit('added',{
          msg: 'changed',
          collection: "test",
          id: '0',
          fields: {isOk:false}
        });

        server.ddpConnection.emit('ready',{
          msg: 'ready',
<<<<<<< HEAD
          subs: [subid]
=======
          subs: [subscriptionId]
>>>>>>> 2.x.x
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

<<<<<<< HEAD
      let sub = await server.sub("testsub");
      subid = sub.subid;

      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

=======
>>>>>>> 2.x.x
      await sub.ready();

      assert.deepEqual(server.collections['test'][0],{
        id: '0',
        isOk: true
      });

    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
