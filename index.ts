import {IOptions} from "./lib/IOptions";
import {App} from "./lib/app";

export {App} from './lib/app'
export {IRequest} from './lib/request'
export {IResponse} from './lib/response'

export  function rocketjet(options?: IOptions) {
    return new App(options)
}

export default function (options?: IOptions) {
    return rocketjet(options);
}