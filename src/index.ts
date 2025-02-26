import expressWsBase from './express-ws'
import * as types from './types'

export * from './types'
export const expressWs = Object.assign(expressWsBase, types);
export default expressWs;

// For CommonJS compatibility
if (typeof module !== 'undefined') {
    module.exports = expressWs;
    module.exports.default = expressWs;
}

// based on https://github.com/DefinitelyTyped/DefinitelyTyped/blob/536df7e9e26fd89ec1305bb4a7b600381a6b4cd3/types/express-ws/index.d.ts

import * as Core from "express-serve-static-core";
import { WithWebsocketMethod } from './types';

declare module 'express-serve-static-core' {
	export interface Router extends WithWebsocketMethod { }
}
