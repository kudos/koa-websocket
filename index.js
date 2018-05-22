const url = require('url');
const https = require('https');
const compose = require('koa-compose');
const co = require('co');
const ws = require('ws');

const WebSocketServer = ws.Server;
const debug = require('debug')('koa:websockets');

function KoaWebSocketServer(app) {
  this.app = app;
  this.middleware = [];
}

KoaWebSocketServer.prototype.listen = function listen(options) {
  this.server = new WebSocketServer(options);
  this.server.on('connection', this.onConnection.bind(this));
};

KoaWebSocketServer.prototype.onConnection = function onConnection(socket, req) {
  debug('Connection received');
  socket.on('error', (err) => {
    debug('Error occurred:', err);
  });
  const fn = co.wrap(compose(this.middleware));

  const context = this.app.createContext(req);
  context.websocket = socket;
  context.path = url.parse(req.url).pathname;

  fn(context).catch((err) => {
    debug(err);
  });
};

KoaWebSocketServer.prototype.use = function use(fn) {
  this.middleware.push(fn);
  return this;
};

module.exports = function middleware(app, wsOptions, httpsOptions) {
  const oldListen = app.listen;
  app.listen = function listen(...args) {
    debug('Attaching server...');
    if (typeof httpsOptions === 'object') {
      const httpsServer = https.createServer(httpsOptions, app.callback());
      app.server = httpsServer.listen(...args);
    } else {
      app.server = oldListen.apply(app, args);
    }
    const options = { server: app.server };
    if (wsOptions) {
      Object.keys(wsOptions).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(wsOptions, key)) {
          options[key] = wsOptions[key];
        }
      });
    }
    app.ws.listen(options);
    return app.server;
  };
  app.ws = new KoaWebSocketServer(app);
  return app;
};
