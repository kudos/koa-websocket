'use strict';

var assert = require('assert'),
  WebSocket = require('ws'),
  koa = require('koa'),
  route = require('koa-route');

var koaws = require('..');

describe('should route ws messages seperately', function() {
  var app = koaws(koa());
  app.ws.use(route.all('/abc', function*() {
    this.websocket.on('message', function(message) {
      this.websocket.send(message);
    }.bind(this));
  }));

  app.ws.use(route.all('/def', function*() {
    this.websocket.on('message', function(message) {
      this.websocket.send(message);
    }.bind(this));
  }));

  var server = app.listen();

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
});
