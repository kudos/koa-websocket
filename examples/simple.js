const Koa = require('koa');
const Router = require('@koa/router');
const websockify = require('..');

const app = websockify(new Koa());

const wsRouter = Router();
const router = Router();

// Regular middleware
wsRouter.use((ctx, next) => {
  // return `next` to pass the context (ctx) on to the next ws middleware
  return next(ctx);
});

// Using routes
wsRouter.get('/', async (ctx, next) => {
  // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
  // the websocket is added to the context on `ctx.websocket`.
  ctx.websocket.send('Hello World');
  ctx.websocket.on('message', (message) => {
    // do something with the message from client
    if (message.toString() === 'ping') {
      ctx.websocket.send('pong');
    }
  });
  return next;
});

// A normal http route to set up a basic ws test
router.get('/', async (ctx, next) => {
  ctx.body = `<script>
    ws = new WebSocket("ws://localhost:3000");
    ws.addEventListener('open', () => { ws.send("ping"); });
  </script>Check the network inspector!`;
  return next;
});

// Attach both routers
// Note it's app.ws.use for our ws router
app.ws.use(wsRouter.routes()).use(wsRouter.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
