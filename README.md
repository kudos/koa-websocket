# koa-websocket

[![Circle CI](https://circleci.com/gh/kudos/koa-websocket.svg?style=svg)](https://circleci.com/gh/kudos/koa-websocket)

> This is for Koa 1, if you're looking for Koa/Koa-route 2 compatibility see the `next` branch.

## Installation

`npm install koa-websocket`

## Usage

Server:
```js
const koa = require('koa'),
  route = require('koa-route'),
  websockify = require('koa-websocket');

const app = websockify(koa());

/**
 * We define a route handler for when a new connection is made.
 * The endpoint can be anything you want the client to connect to.
 * If our WebSocket server address is `ws://localhost:3000` and our route is `/`,
 * this will handle any new WebSocket connections to `ws://localhost:3000/`.
 * If our route was `/test`, the handler would fire only when
 * a connection was made to `ws://localhost:3000/test`.
 */
app.ws.use(route.all('/', function* (next) {
  /**
   *`this` refers to the context in the `app.ws` instance, not `app`. `app` and `app.ws` use separate middleware/contexts.
   * to access a middleware's context here, you must pass the middleware to `app.ws.use()`.
   */

   // the websocket is added to the context as `this.websocket`.
  this.websocket.on('message', function(message) {
    // print message from the client
    console.log(message);
  });

  // send a message to our client
  this.websocket.send('Hello Client!');

  // yielding `next` will pass the context (this) on to the next ws middleware
  yield next;
}));

app.listen(3000);

```

Client:
Here is a simple client using the WebSockets API, which is built-in to the browser. (Make sure you check that your browser version supports it.)

```js
/**
 * See "Writing WebSocket client applications" on MDN for more:
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
 */
const socket = new WebSocket('ws://localhost:3000/');
socket.onopen = function (event) {
  // send a message to the server
  socket.send('Hello server!');
};

socket.onmessage = function (event) {
  // print message from server
  console.log(event.data);
};
```

## Sharing middleware between Koa and WebSockets
To use middleware in WebSockets, the middleware must be passed in to `app.ws.use()`. Passing your middleware only to `app.use()` will not make it available in WebSockets.  You can share your middleware between Koa and WebSockets by passing an instance of the middleware to both `app.use()` and `app.ws.use()`.

The following example shows how to share a session store with WebSockets.

### Example: Sharing a session store
```js
const koa = require('koa'),
  route = require('koa-route'),
  session = require('koa-session'),
  websockify = require('koa-websocket');

const app = websockify(koa());

var sessionStore = session(app);

// pass the session store middleware to both the app and app.ws
// to share it between Koa and websockets
app.use(sessionStore);
app.ws.use(sessionStore);

app.ws.use(route.all('/', function* (next) {
  // `this` context now contains `this.session`
  console.log(this.session); // prints the Koa session object
  yield next;
}));

app.listen(3000);

```
