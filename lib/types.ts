import {IResponse} from "./response";
import {IRequest} from "./request";
import {Methods} from "appolo-route/index";

export type MiddlewareHandler = ((req: IRequest, res: IResponse, next: NextFn) => void)
export type MiddlewareHandlerAny = ((req: any, res: any, next: any) => void)

export type MiddlewareHandlerOrAny = MiddlewareHandler | MiddlewareHandlerAny;

export type MiddlewareHandlerError = ((e: any, req: IRequest, res: IResponse, next: NextFn) => void)
export type MiddlewareHandlerAnyError = ((e: any, req: any, res: any, next: any) => void)

export type MiddlewareHandlerErrorOrAny = MiddlewareHandlerError | MiddlewareHandlerAnyError

export type NextFn = (err?: Error) => void

export type MiddlewareHandlerParams = MiddlewareHandlerOrAny | MiddlewareHandlerErrorOrAny


export interface IRouteHandler {
    path: string
    method: keyof typeof Methods
    middlewares: MiddlewareHandlerOrAny[]
    errors: MiddlewareHandlerErrorOrAny[]
    route: any
}