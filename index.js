/*
 * add WebSocket support to a Koa application
 *
 * - adds private _webSocketListen() method to application
 * - re-use the middleware stack from the Koa application
 * - close WebSocket when middleware stack fails
 * - close WebSocket when route handler doesn't remove it from context
 * - use ES6 and "ws" 3.x API
 */

'use strict';

const compose = require('koa-compose'),
      ws      = require('ws');

/*
 * const koaWebSockify(app, [wsOptions])
 *
 *  app       - Koa Application
 *  wsOptions - parameters for ws.Server (optional)
 */
module.exports = (app, wsOptions) => {
    // add private method to Koa application
    app._webSocketsListen = function (server) { // needs access to "this"
        // create WebSocket server; attach it to server
        const wsServer = new ws.Server(
                  Object.assign(wsOptions || {}, {
                      server: server,
                  })
              );

        // compose middleware stack from Koa application
        const middleware = compose(this.middleware);

        // WebSocket connected handler
        wsServer.on('connection', (socket, request) => {
            /*
             * Route handler should install an error handler
             *
             * // install default socket error handler
             * socket.once('error', error => {
             *     ...
             * });
             *
             * The following code is similar to app.callback(). We can't
             * use that, because we need to pass down the WebSocket.
             */
            return Promise.resolve()
                .then(() => {
                    // there is no API to create ServerReponse object :-(
                    const dummyResp = {
                              end()          {},
                              setHeader()    {},
                              removeHeader() {},
                          },
                          context = this.createContext(request, dummyResp);

                    // add WebSocket to context for route handlers
                    context.websocket = socket;

                    return context;
                })
                .then(context => Promise.resolve()
                    .then(() => middleware(context))
                    .then(() => {
                        // this indicates error in route handler code
                        if (context.websocket)
                            socket.close(4000, `ERROR: WebSocket for '${context.url}' not handled`);
                    })
                )
                .catch(error  => socket.close(4000, error.message));
        });
    };

    // allow chaining
    return app;
};
