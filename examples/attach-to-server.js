/*
 * Don't use app.listen(), instead attach to existing server
 */

'use strict';

const Koa        = require('koa'),
      Router     = require('koa-router'),
      http       = require('http'),  // or 'https'
      webSockify = require('../'),
      app        = new Koa(),
      router     = new Router(),
      server     = http.createServer(app.callback());

// WebSocket routes
router.get('/*', ctx => {
    ctx.websocket.send('Hello World');
    ctx.websocket.on('message', message => {
        console.log(message);
    });
});

webSockify(app);
app.ws
    .use(router.routes())
    .use(router.allowedMethods());

// attach WebSockets to existing server
app.ws.listen({
    server: server,
});

// start server
server.listen(3000);
