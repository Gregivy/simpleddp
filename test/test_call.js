const assert = require('chai').assert;

const simpleDDP = require('../lib/simpleddp');
const ws = require("ws");

const opts = {
    endpoint: "ws://someserver.com/websocket",
    SocketConstructor: ws,
    reconnectInterval: 5000,
    maxTimeout: 25
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

  describe('#apply', function (){

    it('should return promise and afterwards then function should run', function (done) {

      server.apply("somemethod").then(function () {
        done()
      })

      server.ddpConnection.emit('result', {
        msg: 'result',
        id: '1',
        result: 'ok'
      });

    });

    if('a rejection should be fire if the max timeout has been exceeded', function (done) {

      server.apply("somemethod").then(function() {
        done()
      })

      server.apply("somemethod").then(function () {
        assert.fail();
      }).catch(function (error) {
        assert.isNotNull(error)
        done();
      });

      setTimeout(function () {
        server.ddpConnection.emit('result', {
          msg: 'result',
          id: '1',
          result: 'ok'
        });
      }, 50)
    });

  });

  after(function() {
    // runs after all tests in this block
    server.disconnect();
    server = null;
  });
});
