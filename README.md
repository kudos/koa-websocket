# koa-websocket

[![Circle CI](https://circleci.com/gh/kudos/koa-websocket.svg?style=svg)](https://circleci.com/gh/kudos/koa-websocket)

## Installation

`npm install koa-websocket`

## Usage

```js
const koa = require('koa'),
  route = require('koa-route'),
  websockify = require('koa-websocket');

const app = websockify(koa());

// Note it's app.ws.use and not app.use
app.ws.use(route.all('/test/:id', function* (next) {
  this.send('Hello World');
  // `this` is the socket passed from WebSocketServer to connection listeners
  this.on('message', function(message) {
    // do something with the message from client
  });
  // yielding `next` will pass the socket on to the next ws middleware
}));

app.listen(3000);

```