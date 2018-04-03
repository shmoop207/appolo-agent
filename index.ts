import {IOptions} from "./lib/IOptions";
import {App} from "./lib/app";
import {MiddlewareHandlerParams} from "./lib/types";

export {App} from './lib/app'
export {IRequest} from './lib/request'
export {IResponse} from './lib/response'
export {MiddlewareHandlerParams} from './lib/types'

export  function rocketjet(options?: IOptions) {
    return new App(options)
}

export default function (options?: IOptions) {
    return rocketjet(options);
}