# koa-websocket

[![Circle CI](https://circleci.com/gh/kudos/koa-websocket.svg?style=svg)](https://circleci.com/gh/kudos/koa-websocket)

> Koa v2 is now the default. For Koa v1 support install with koa-websocket@2 and see the `legacy` branch.

Supports `ws://` and `wss://`

## Installation

`npm install koa-websocket`

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

Example with Let's Encrypt ([the Greenlock package](https://git.daplie.com/Daplie/greenlock-koa)):

```js
const Koa = require('koa');
const greenlock = require('greenlock-express');
const websockify = require('koa-websocket');
 
const le = greenlock.create({
  // all your sweet Let's Encrypt options here
});
 
// the magic happens right here
const app = websockify(new Koa(), wsOptions, le.httpsOptions);
 
app.ws.use((ctx) => {
   // the websocket is added to the context as `ctx.websocket`.
  ctx.websocket.on('message', function(message) {
    // do something
  });
});
 
app.listen(3000);
```

With custom websocket options.

```js
const Koa = require('koa'),
  route = require('koa-route'),
  websockify = require('koa-websocket');

const wsOptions = {};
const app = websockify(new Koa(), wsOptions);

app.ws.use(route.all('/', (ctx) => {
   // the websocket is added to the context as `ctx.websocket`.
  ctx.websocket.on('message', function(message) {
    // print message from the client
    console.log(message);
  });
}));

app.listen(3000);
```

## API
#### websockify(KoaApp, [WebSocketOptions], [httpsOptions])
The WebSocket options object just get passed right through to the `new WebSocketServer(options)` call.

The optional HTTPS options object gets passed right into `https.createServer(options)`. If the HTTPS options are 
passed in, koa-websocket will use the built-in Node HTTPS server to provide support for the `wss://` protocol.

## License
MIT
