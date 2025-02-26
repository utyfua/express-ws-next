/* This module does a lot of monkeypatching, but unfortunately that appears to be the only way to
 * accomplish this kind of stuff in Express.
 *
 * Here be dragons. */

import * as http from 'http';
import type * as https from "https";
import express from 'express';
import * as ws from 'ws';

import websocketUrl from './websocket-url';
import addWsMethod from './add-ws-method';
import { Application, Options, Router, WithWebsocketProps } from './types';

export function expressWs(
  app: express.Application,
  httpServer?: http.Server | https.Server,
  options: Options = {},
): {
  app: Application;
  applyTo(target: express.Router): void;
  getWss(): ws.Server;
} {
  const innerApp = app as Application;
  let server = httpServer;

  if (server === null || server === undefined) {
    /* No HTTP server was explicitly provided, create one for our Express application. */
    server = http.createServer(app);

    app.listen = server.listen.bind(server);
  }

  /* Make our custom `.ws` method available directly on the Express application. You should
   * really be using Routers, though. */
  addWsMethod(innerApp);

  /* Monkeypatch our custom `.ws` method into Express' Router prototype. This makes it possible,
   * when using the standard Express Router, to use the `.ws` method without any further calls
   * to `makeRouter`. When using a custom router, the use of `makeRouter` may still be necessary.
   *
   * This approach works, because Express does a strange mixin hack - the Router factory
   * function is simultaneously the prototype that gets assigned to the resulting Router
   * object. */
  if (!options.leaveRouterUntouched) {
    // @ts-ignore todo: fix this
    addWsMethod(express.Router);
  }

  // allow caller to pass in options to WebSocketServer constructor
  const wsOptions = options.wsOptions || {};
  wsOptions.server = server;
  const wsServer = new ws.WebSocketServer(wsOptions);

  wsServer.on('connection', (socket, requestOrig) => {
    const request = requestOrig as http.IncomingMessage & WithWebsocketProps;
    request.ws = socket;
    request.wsHandled = false;

    /* By setting this fake `.url` on the request, we ensure that it will end up in the fake
     * `.get` handler that we defined above - where the wrapper will then unpack the `.ws`
     * property, indicate that the WebSocket has been handled, and call the actual handler. */
    request.url = websocketUrl(request.url!);

    const dummyResponse = new http.ServerResponse(request);

    // @ts-expect-error
    dummyResponse.writeHead = function writeHead(statusCode) {
      if (statusCode > 200) {
        /* Something in the middleware chain signalled an error. */
        // @ts-expect-error
        dummyResponse._header = '';
        socket.close();
      }
    };

    innerApp.handle(request, dummyResponse, () => {
      if (!request.wsHandled) {
        /* There was no matching WebSocket-specific route for this request. We'll close
         * the connection, as no endpoint was able to handle the request anyway... */
        socket.close();
      }
    });
  });

  return {
    app: innerApp,
    getWss: function getWss() {
      return wsServer;
    },
    applyTo: function applyTo(router: express.Router) {
      addWsMethod(router as Router);
    }
  };
}
export default expressWs;
