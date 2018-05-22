const assert = require('assert');
const fs = require('fs');
const WebSocket = require('ws');
const Koa = require('koa');
const route = require('koa-route');

const koaws = require('..');

describe('should route ws messages seperately', () => {
  const app = koaws(new Koa());

  app.ws.use((ctx, next) => {
    ctx.websocket.on('message', (message) => {
      if (message === '123') {
        ctx.websocket.send(message);
      }
    });
    return next();
  });

  app.ws.use(route.all('/abc', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  app.ws.use(route.all('/abc', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  app.ws.use(route.all('/def', (ctx) => {
    ctx.websocket.on('message', (message) => {
      ctx.websocket.send(message);
    });
  }));

  let server = null;

  before((done) => {
    server = app.listen(done);
  });

  after((done) => {
    server.close(done);
  });

  it('sends 123 message to any route', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/not-a-route`);
    ws.on('open', () => {
      ws.send('123');
    });
    ws.on('message', (message) => {
      assert(message === '123');
      done();
      ws.close();
    });
  });

  it('sends abc message to abc route', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/abc`);
    ws.on('open', () => {
      ws.send('abc');
    });
    ws.on('message', (message) => {
      assert(message === 'abc');
      done();
      ws.close();
    });
  });

  it('sends def message to def route', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/def`);
    ws.on('open', () => {
      ws.send('def');
    });
    ws.on('message', (message) => {
      assert(message === 'def');
      done();
      ws.close();
    });
  });

  it('handles urls with query parameters', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/abc?foo=bar`);
    ws.on('open', () => {
      ws.send('abc');
    });
    ws.on('message', (message) => {
      assert(message === 'abc');
      done();
      ws.close();
    });
  });
});

describe('should support custom ws server options', () => {
  const app = koaws(new Koa(), {
    handleProtocols(protocols) {
      if (protocols.indexOf('bad_protocol') !== -1) { return false; }
      return protocols.pop();
    },
  });

  let server = null;

  before((done) => {
    server = app.listen(done);
  });

  after((done) => {
    server.close(done);
  });

  it('reject bad protocol use wsOptions', (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address().port}/abc`, ['bad_protocol']);
    ws.on('error', () => {
      assert(true);
      done();
      ws.close();
    });
  });
});

describe('should support custom http server options', () => {
  // The cert is self-signed.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const secureApp = koaws(new Koa(), {}, {
    key: fs.readFileSync('./test/key.pem'),
    cert: fs.readFileSync('./test/cert.pem'),
  });

  let server = null;

  before((done) => {
    server = secureApp.listen(done);
  });

  after((done) => {
    server.close(done);
  });

  it('supports wss protocol', (done) => {
    const ws = new WebSocket(`wss://localhost:${server.address().port}/abc`);
    ws.on('open', () => {
      assert(true);
      done();
      ws.close();
    });
  });
});
