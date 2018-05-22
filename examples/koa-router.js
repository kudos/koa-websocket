const koa = require('koa');
const router = require('koa-router');
const websockify = require('..');

const app = koa();

const api = router();

websockify(app);

api.get('/*', function* get(next) {
  this.websocket.send('Hello World');
  this.websocket.on('message', (message) => {
    console.log(message);
  });
  yield next;
});

app.ws.use(api.routes()).use(api.allowedMethods());
app.listen(3000);
