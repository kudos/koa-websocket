/*
 * Serve HTTP & WebSockets in same application
 */

'use strict';

const Koa        = require('koa'),
      Router     = require('koa-router'),
      webSockify = require('../'),
      app        = new Koa(),
      httpRouter = new Router(),
      wsRouter   = new Router();

// HTTP routes
httpRouter.get('/http', ctx => {
    ctx.body = 'Hello World';
});

app.use(httpRouter.routes())
   .use(httpRouter.allowedMethods());

// WebSocket routes
wsRouter.get('/websocket', ctx => {
    ctx.websocket.send('Hello World');
    ctx.websocket.on('message', message => {
        console.log(message);
    });
});

webSockify(app);
app.ws
    .use(wsRouter.routes())
    .use(wsRouter.allowedMethods());

// start server
app.listen(3000);
