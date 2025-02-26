// based on https://github.com/DefinitelyTyped/DefinitelyTyped/blob/536df7e9e26fd89ec1305bb4a7b600381a6b4cd3/types/express-ws/index.d.ts

import * as express from "express";
import * as http from "http";
import * as ws from "ws";

export type Application = express.Application & WithWebsocketMethod & {
    handle(req: http.IncomingMessage, res: http.ServerResponse, callback: () => void): void;
};
export type Router = express.Router & WithWebsocketMethod;
export type Request = express.Request & WithWebsocketProps;

export interface Options {
    leaveRouterUntouched?: boolean | undefined;
    wsOptions?: ws.ServerOptions | undefined;
}

export type WebsocketRequestHandler = (ws: ws.WebSocket, req: Request, next: express.NextFunction) => void;
export type WebsocketMethod<T> = (this: T, route: string, ...middlewares: WebsocketRequestHandler[]) => T;

export interface WithWebsocketMethod {
    ws: WebsocketMethod<this>;
}

export interface WithWebsocketProps {
    ws?: ws.WebSocket,
    wsHandled?: boolean
}
