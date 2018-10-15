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

  describe('#sub', function (){

    it('should subscribe and simpleDDP.collections should update', function (done) {

      let sub = server.sub("testsub");

      sub.onReady(function(){
        assert.deepEqual(server.collections['test'][0],{
          id: '0',
          isOk: true
        });
        done();
      });

      server.ddpConnection.emit('added',{
        msg: 'added',
        collection: "test",
        id: '0',
        fields: {isOk:true}
      });

      server.ddpConnection.emit('ready',{
        msg: 'ready',
        subs: ['0']
      });

    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
