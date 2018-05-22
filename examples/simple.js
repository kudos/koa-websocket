'use strict';

const Koa        = require('koa'),
      route      = require('koa-route'),
      websockify = require('../'),
      app        = new Koa();

app.use(route.all('/test/:id', ctx => {
    // `ctx` is the regular koa context created from the `ws` onConnection
    // `request` object.  the websocket is added to the context on
    // `ctx.websocket`.
    ctx.websocket.send('Hello World');
    ctx.websocket.on('message', message => {
        console.log(message);
    });
    delete ctx.websocket;
}));

websockify(app)._webSocketsListen(app.listen(3000));
