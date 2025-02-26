import { NextFunction, Response } from "express";
import { Request, WebsocketRequestHandler } from "./types";

export default function wrapMiddleware(middleware: WebsocketRequestHandler) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.ws !== null && req.ws !== undefined) {
      req.wsHandled = true;
      try {
        /* Unpack the `.ws` property and call the actual handler. */
        middleware(req.ws, req, next);
      } catch (err) {
        /* If an error is thrown, let's send that on to any error handling */
        next(err);
      }
    } else {
      /* This wasn't a WebSocket request, so skip this middleware. */
      next();
    }
  };
}
