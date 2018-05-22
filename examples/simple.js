const koa = require('koa');
const route = require('koa-route');
const websockify = require('..');

const app = websockify(koa());

// Note it's app.ws.use and not app.use
app.ws.use(route.all('/test/:id', function* all(next) {
  // `this` is the regular koa context created from the `ws`
  // onConnection `socket.upgradeReq` object.
  // The websocket is added to the context on `this.websocket`.
  this.websocket.send('Hello World');
  this.websocket.on('message', (message) => {
    // Do something with the message from client
    console.log(message);
  });
  // Yielding `next` will pass the context (this) on to the next ws middleware
  yield next;
}));


app.listen(3000);
