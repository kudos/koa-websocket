'use strict';

const assert = require('assert'),
  fs = require('fs'),
  WebSocket = require('ws'),
  Koa = require('koa'),
  route = require('koa-route');

const koaws = require('..');

describe('should route ws messages seperately', function() {
  const app = koaws(new Koa());

  app.ws.use(function(ctx, next){
    ctx.websocket.on('message', function(message) {
      if (message == '123') {
        ctx.websocket.send(message);
      }
    });
    return next();
  });

  app.ws.use(route.all('/abc', function(ctx){
    ctx.websocket.on('message', function(message) {
      ctx.websocket.send(message);
    });
  }));

  app.ws.use(route.all('/abc', function(ctx){
    ctx.websocket.on('message', function(message) {
      ctx.websocket.send(message);
    });
  }));

  app.ws.use(route.all('/def', function(ctx){
    ctx.websocket.on('message', function(message) {
      ctx.websocket.send(message);
    });
  }));

  let server = null;

  before(function(done){
    server = app.listen(done);
  });

  after(function(done){
    server.close(done);
  });

  it('sends 123 message to any route', function(done){
    const ws = new WebSocket('ws://localhost:' + server.address().port + '/not-a-route');
    ws.on('open', function() {
      ws.send('123');
    });
    ws.on('message', function(message) {
      assert(message === '123');
      done();
      ws.close();
    });
  });

  it('sends abc message to abc route', function(done){
    const ws = new WebSocket('ws://localhost:' + server.address().port + '/abc');
    ws.on('open', function() {
      ws.send('abc');
    });
    ws.on('message', function(message) {
      assert(message === 'abc');
      done();
      ws.close();
    });
  });

  it('sends def message to def route', function(done){
    const ws = new WebSocket('ws://localhost:' + server.address().port + '/def');
    ws.on('open', function() {
      ws.send('def');
    });
    ws.on('message', function(message) {
      assert(message === 'def');
      done();
      ws.close();
    });
  });

  it('handles urls with query parameters', function(done){
    const ws = new WebSocket('ws://localhost:' + server.address().port + '/abc?foo=bar');
    ws.on('open', function() {
      ws.send('abc');
    });
    ws.on('message', function(message) {
      assert(message === 'abc');
      done();
      ws.close();
    });
  });
});

describe('should support custom ws server options', function() {

  const app = koaws(new Koa(), {
    handleProtocols: function (protocols) {
      if (protocols.indexOf('bad_protocol') !== -1)
        return false;
      return protocols.pop();
    }
  });

  let server = null;

  before(function(done){
    server = app.listen(done);
  });

  after(function(done){
    server.close(done);
  });

  it('reject bad protocol use wsOptions', function(done){
    const ws = new WebSocket('ws://localhost:' + server.address().port + '/abc', ['bad_protocol']);
    ws.on('error', function() {
      assert(true);
      done();
      ws.close();
    });
  });
});

describe('should support custom http server options', function() {

  // The cert is self-signed.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const secureApp = koaws(new Koa(), {}, {
    key: fs.readFileSync('./test/key.pem'),
    cert: fs.readFileSync('./test/cert.pem'),
  });

  let server = null;

  before(function(done){
    server = secureApp.listen(done);
  });

  after(function(done){
    server.close(done);
  });

  it('supports wss protocol', function(done){
    const ws = new WebSocket('wss://localhost:' + server.address().port + '/abc');
    ws.on('open', function() {
      assert(true);
      done();
      ws.close();
    });
  });
});
