'use strict';

const assert = require('assert'),
  fs = require('fs'),
  https = require('https'),
  WebSocket = require('ws'),
  Koa = require('koa'),
  route = require('koa-route');

const koaws = require('..');

describe('should route ws messages seperately', function() {
  const app = new Koa();

  app.use(route.all('/abc', function(ctx){
    ctx.websocket.on('message', function(message) {
      this.send(message);
    });
    delete ctx.websocket;
  }));

  app.use(route.all('/abc', function(ctx){
    ctx.websocket.on('message', function(message) {
      this.send(message);
    });
    delete ctx.websocket;
  }));

  app.use(route.all('/def', function(ctx){
    ctx.websocket.on('message', function(message) {
      this.send(message);
    });
    delete ctx.websocket;
  }));

  app.use(function(ctx, next){
    ctx.websocket.on('message', function(message) {
      if (message == '123') {
        this.send(message);
      }
    });
    delete ctx.websocket;
    return next();
  });

  let server = null;

  before(function(done){
    server = app.listen(done);
    koaws(app)._webSocketsListen(server);
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

  const app          = new Koa(),
        websockified = koaws(app, {
    handleProtocols: function (protocols) {
      if (protocols.indexOf('bad_protocol') !== -1)
        return false;
      return protocols.pop();
    }
  });

  let server = null;

  before(function(done){
    server = app.listen(done);
    websockified._webSocketsListen(server);
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

  const secureApp    = new Koa(),
        websockified = koaws(secureApp),
        server       = https.createServer({
          key:  fs.readFileSync('./test/key.pem'),
          cert: fs.readFileSync('./test/cert.pem'),
        }, secureApp.callback());

  before(function(done){
    websockified._webSocketsListen(server);
    server.listen(done);
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
