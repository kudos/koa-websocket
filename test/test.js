'use strict';

var assert = require('assert'),
  WebSocket = require('ws'),
  Koa = require('koa'),
  route = require('koa-route');

var koaws = require('..');

describe('should route ws messages seperately', function() {
  const app = koaws(new Koa(), {
    handleProtocols: function (protocols) {
      if (protocols.indexOf("bad_protocol") !== -1)
        return false;
      return protocols.pop();
    }
  });

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

  var server = app.listen();

  it('sends 123 message to any route', function(done){
    var ws = new WebSocket('ws://localhost:' + server.address().port + '/not-a-route');
    ws.on('open', function() {
      ws.send('123');
    });
    ws.on('message', function(message) {
      assert(message === '123');
      done();
    });
  });

  it('sends abc message to abc route', function(done){
    var ws = new WebSocket('ws://localhost:' + server.address().port + '/abc');
    ws.on('open', function() {
      ws.send('abc');
    });
    ws.on('message', function(message) {
      assert(message === 'abc');
      done();
    });
  });

  it('sends def message to def route', function(done){
    var ws = new WebSocket('ws://localhost:' + server.address().port + '/def');
    ws.on('open', function() {
      ws.send('def');
    });
    ws.on('message', function(message) {
      assert(message === 'def');
      done();
    });
  });

  it('handles urls with query parameters', function(done){
    var ws = new WebSocket('ws://localhost:' + server.address().port + '/abc?foo=bar');
    ws.on('open', function() {
      ws.send('abc');
    });
    ws.on('message', function(message) {
      assert(message === 'abc');
      done();
    });
  });

  it('reject bad protocol use wsOptions', function(done){
    var ws = new WebSocket('ws://localhost:' + server.address().port + '/abc', ['bad_protocol']);
    ws.on('open', function() {
      ws.send('abc');
    });
    ws.on('message', function(message) {
      assert(false);
      done();
    });
    ws.on('unexpected-response', function() {
      assert(true);
      done();
    });
  });
});
;
