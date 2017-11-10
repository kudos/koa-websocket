'use strict';

const url = require('url'),
  https = require('https'),
  compose = require('koa-compose'),
  co = require('co'),
  ws = require('ws');
const WebSocketServer = ws.Server;
const debug = require('debug')('koa:websockets');

function KoaWebSocketServer (app) {
  this.app = app;
  this.middleware = [];
}

KoaWebSocketServer.prototype.listen = function (options) {
  this.server = new WebSocketServer(options);
  this.server.on('connection', this.onConnection.bind(this));
};

KoaWebSocketServer.prototype.onConnection = function(socket, request) {
  debug('Connection received');
  socket.on('error', function (err) {
    debug('Error occurred:', err);
  });
  const fn = co.wrap(compose(this.middleware));

  const context = this.app.createContext(request);
  context.websocket = socket;
  context.path = url.parse(request.url).pathname;

  fn(context).catch(function(err) {
    debug(err);
  });
};

KoaWebSocketServer.prototype.use = function (fn) {
  this.middleware.push(fn);
  return this;
};

module.exports = function (app, wsOptions, httpsOptions) {
  const oldListen = app.listen;
  app.listen = function () {
    debug('Attaching server...');
    if (typeof httpsOptions === 'object') {
      const httpsServer = https.createServer(httpsOptions, app.callback());
      app.server = httpsServer.listen.apply(httpsServer, arguments);
    } else {
      app.server = oldListen.apply(app, arguments);
    }
    const options = { server: app.server};
    if (wsOptions) {
      for (var key in wsOptions) {
        if (wsOptions.hasOwnProperty(key)) {
          options[key] = wsOptions[key];
        }
      }
    }
    app.ws.listen(options);
    return app.server;
  };
  app.ws = new KoaWebSocketServer(app);
  return app;
};
