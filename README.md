# koa-websocket

[![Build Status](https://travis-ci.org/kudos/koa-websocket.svg?branch=master)](https://travis-ci.org/kudos/koa-websocket)

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