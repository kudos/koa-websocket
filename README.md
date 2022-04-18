# koa-websocket

[![CI Status](https://github.com/kudos/koa-websocket/actions/workflows/node.js.yml/badge.svg)](https://github.com/kudos/koa-websocket/actions)

> Koa v2 is now the default. For Koa v1 support install with koa-websocket@2 and see the `legacy` branch.

Supports `ws://` and `wss://`

## Installation

`npm install koa-websocket`

## Usage

See examples directory for a simple implementation.

### Let's Encrypt

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

## API
#### websockify(KoaApp, [WebSocketOptions], [httpsOptions])
The WebSocket options object just get passed right through to the `new WebSocketServer(options)` call.

The optional HTTPS options object gets passed right into `https.createServer(options)`. If the HTTPS options are 
passed in, koa-websocket will use the built-in Node HTTPS server to provide support for the `wss://` protocol.

## License
MIT
