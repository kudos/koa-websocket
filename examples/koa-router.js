var koa = require('koa');  
var websockify = require('koa-websocket');
var router = require('koa-router');
var app = koa();

var api = router();
var socket = websockify(app);

api.get('/*', function* (next) {
  this.websocket.send('Hello World');
  this.websocket.on('message', function(message) {
    console.log(message);
  });
});

app.ws.use(api.routes()).use(api.allowedMethods());
app.listen(3000);
