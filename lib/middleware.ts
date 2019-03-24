import {IResponse} from "./response";
import {IRequest} from "./request";
import {MiddlewareHandlerData, MiddlewareHandler, MiddlewareHandlerError, NextFn} from "./types";
import {HttpError} from "./errors/httpError";
import {ErrorHandler} from "./errorHandler";
import {Events} from "./events";


export function handleMiddleware(req: IRequest, res: IResponse, middlewares: (MiddlewareHandler | MiddlewareHandlerData)[], errorsMiddleware: MiddlewareHandlerError[], num: number = 0, err?: Error, data?: any) {

    if (err) {
        return handleMiddlewareError(req, res, errorsMiddleware, err);
    }

    if (num == middlewares.length) {
        return;
    }

    let fn = middlewares[num];

    let next: any = req.next = handleMiddleware.bind(null, req, res, middlewares, errorsMiddleware, num + 1);

    try {
        data ? (fn as MiddlewareHandlerData)(data, req, res, next) : (fn as MiddlewareHandler)(req, res, next);
    } catch (e) {
        next(e)
    }

}

export function handleMiddlewareError(req: IRequest, res: IResponse, middlewares: MiddlewareHandlerError[], err: Error, num: number = 0) {

    if (num == middlewares.length) {
        return;
    }

    let fn = middlewares[num];

    let next: any = req.next = handleMiddlewareError.bind(null, req, res, middlewares, err, num + 1);

    try {
        fn(err, req, res, next);
    } catch (e) {
        next(e);
    }

}

export function notFoundMiddleware(req: IRequest, res: IResponse, next: NextFn) {
    next(new HttpError(404, `Cannot ${req.method} ${req.pathName}`))
}

export function errorMiddleware(e: Error | HttpError, req: IRequest, res: IResponse, next: NextFn) {

    if (res.headersSent || res.sending) {
        return;
    }

    let err: HttpError = e as HttpError || new HttpError(500);

    res.statusCode = ErrorHandler.getStatusCode(err);

    let msg = ErrorHandler.getErrorMessage(err, res.statusCode);

    res.json(msg);
}

export function fireEventMiddleware(req: IRequest, res: IResponse, next: NextFn) {
    req.app.fireEvent(Events.RequestInit, req, res);
    next();
}

