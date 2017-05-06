# koa-websocket

[![Circle CI](https://circleci.com/gh/kudos/koa-websocket.svg?style=svg)](https://circleci.com/gh/kudos/koa-websocket)

> Koa v2 is now the default. For Koa v1 support install with koa-websocket@2 and see the `legacy` branch.

## Installation

`npm install koa-websocket@next`

## Usage

```js
const Koa = require('koa'),
  route = require('koa-route'),
  websockify = require('koa-websocket');

const app = websockify(new Koa());

// Regular middleware
// Note it's app.ws.use and not app.use
app.ws.use(function(ctx, next) {
  // return `next` to pass the context (ctx) on to the next ws middleware
  return next(ctx);
});

// Using routes
app.ws.use(route.all('/test/:id', function (ctx) {
  // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
  // the websocket is added to the context on `ctx.websocket`.
  ctx.websocket.send('Hello World');
  ctx.websocket.on('message', function(message) {
    // do something with the message from client
        console.log(message);
  });
}));

app.listen(3000);

```

With custom websocket options.

```
const Koa = require('koa'),
  route = require('koa-route'),
  websockify = require('koa-websocket');

const wsOptions = {};
const app = websockify(new Koa(), wsOptions);

app.ws.use(route.all('/', function* (ctx) {
   // the websocket is added to the context as `this.websocket`.
  ctx.websocket.on('message', function(message) {
    // print message from the client
    console.log(message);
  });
}));

app.listen(3000);

```
