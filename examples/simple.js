'use strict';

const koa = require('koa'),
  route = require('koa-route'),
  websockify = require('../');

const app = websockify(koa());

// Note it's app.ws.use and not app.use
app.ws.use(route.all('/test/:id', function* (next) {
  // `this` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
  // the websocket is added to the context on `this.websocket`.
  this.websocket.send('Hello World');
  this.websocket.on('message', function(message) {
    // do something with the message from client
    console.log(message);
  });
  // yielding `next` will pass the context (this) on to the next ws middleware
  yield next;
}));


app.listen(3000);
