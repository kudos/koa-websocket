# koa-websocket



## Installation

`npm install koa-websocket`

## Usage

```js
const koa = require('koa'),
  route = require('koa-route'),
  websockify = require('../');

const app = websockify(koa());

// Note it's app.ws.use and not app.use
app.ws.use(route.all('/test/:id', function* (next) {
  this.on('message', function(message) {
    // do something with the message from client
  });
}));

app.listen(3000);

```