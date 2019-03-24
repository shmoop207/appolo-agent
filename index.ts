import {IOptions} from "./lib/IOptions";
import {Agent} from "./lib/agent";
import {MiddlewareHandler, MiddlewareHandlerAny, MiddlewareHandlerParams, NextFn} from "./lib/types";
import {NotFoundError} from "./lib/errors/notFoundError";
import {UnauthorizedError} from "./lib/errors/unauthorizedError";

export {Agent} from './lib/agent';
export {IApp} from './lib/IApp';
export {HttpError} from './lib/errors/httpError';
export {BadRequestError} from './lib/errors/badRequestError';
export {InternalServerError} from './lib/errors/internalServerError';
export {UnauthorizedError} from './lib/errors/unauthorizedError';
export {NotFoundError} from './lib/errors/notFoundError';
export {IRequest, Request} from './lib/request';
export {IResponse, Response} from './lib/response';
export {Events} from './lib/events';
export {Methods} from 'appolo-route';
export {IOptions} from "./lib/IOptions";
export {
    MiddlewareHandlerParams,
    MiddlewareHandler,
    MiddlewareHandlerAny,
    NextFn,
    MiddlewareHandlerErrorOrAny,
    MiddlewareHandlerOrAny,
    Hooks
} from './lib/types'

export function createAgent(options?: IOptions) {
    return new Agent(options)
}

export default function (options?: IOptions) {
    return new Agent(options);
}
