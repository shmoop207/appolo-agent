import {IResponse} from "./response";
import {IRequest} from "./request";

export type MiddlewareHandler = ((req: IRequest, res: IResponse, next: NextFn) => void)
export type MiddlewareHandlerAny = ((req: any, res: any, next: any) => void)
export type NextFn = (err?: Error) => void

export type MiddlewareHandlerParams =
    MiddlewareHandler
    | MiddlewareHandlerAny
    | (MiddlewareHandler | MiddlewareHandlerAny)