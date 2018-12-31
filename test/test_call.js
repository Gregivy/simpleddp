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

  describe('#call', function (){

    it('should return promise and afterwards then function should run', function (done) {

      server.call("somemethod").then(function() {
        done();
      });

      server.ddpConnection.emit('result',{
        msg: 'result',
        id: '0',
        result: 'ok'
      });

    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
