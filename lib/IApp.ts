import {IEventDispatcher} from "appolo-event-dispatcher";
import {IOptions} from "./IOptions";
import {Methods} from "appolo-route/index";
import {MiddlewareHandler, MiddlewareHandlerError} from "./types";

export interface IApp extends IEventDispatcher {
    options: IOptions
}
