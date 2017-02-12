'use strict';

const url = require('url'),
  compose = require('koa-compose'),
  co = require('co'),
  ws = require('uws');
const WebSocketServer = ws.Server;
const debug = require('debug')('koa:websockets');

function KoaWebSocketServer(app, opts) {
  this.app = app;
  this.opts = opts;
  this.middleware = [];
}

KoaWebSocketServer.prototype.listen = function(server) {
  const opts = Object.assign({
    server: server
  }, this.opts);
  this.server = new WebSocketServer(opts);
  this.server.on('connection', this.onConnection.bind(this));
};

KoaWebSocketServer.prototype.onConnection = function(socket) {
  debug('Connection received');
  socket.on('error', function (err) {
    debug('Error occurred:', err);
  });
  const fn = co.wrap(compose(this.middleware));

  const context = this.app.createContext(socket.upgradeReq);
  context.websocket = socket;
  context.path = url.parse(socket.upgradeReq.url).pathname;

  fn(context).catch(function(err) {
    debug(err);
  });
};

KoaWebSocketServer.prototype.use = function(fn) {
  this.middleware.push(fn);
  return this;
};

module.exports = function(app) {
  const oldListen = app.listen;
  app.listen = function () {
    debug('Attaching server...');
    app.server = oldListen.apply(app, arguments);
    app.ws.listen(app.server);
    return app.server;
  };
  app.ws = new KoaWebSocketServer(app);
  return app;
};
