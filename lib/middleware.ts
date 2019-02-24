import {IResponse} from "./response";
import {IRequest} from "./request";
import {MiddlewareHandler, MiddlewareHandlerError, NextFn} from "./types";
import {HttpError} from "./errors/httpError";
import {ErrorHandler} from "./errorHandler";
import {Events} from "./events";


export function handleMiddleware(req: IRequest, res: IResponse, num: number, middlewares: MiddlewareHandler[], errorsMiddleware: MiddlewareHandlerError[], err?: Error) {

    if (err) {
        return handleMiddlewareError(req, res, 0, errorsMiddleware, err);
    }

    if (num == middlewares.length) {
        return;
    }

    let fn = middlewares[num];

    let next: any = req.next = function (err) {
        if (!next.run) {
            next.run = true;
            handleMiddleware(req, res, num + 1, middlewares, errorsMiddleware, err)
        }
    };


    try {
        fn(req, res, next);
    } catch (e) {
        handleMiddlewareError(req, res, 0, errorsMiddleware, e);
    }

}

export function handleMiddlewareError(req: IRequest, res: IResponse, num: number, middlewares: MiddlewareHandlerError[], err: Error) {


    if (num == middlewares.length) {
        return;
    }

    let fn = middlewares[num];

    let next: any = req.next = function (err) {
        if (!next.run) {
            next.run = true;
            handleMiddlewareError(req, res, num + 1, middlewares, err)
        }
    };


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

    //let options = res.req.app.options;

    let msg = ErrorHandler.getErrorMessage(err, res.statusCode);

    res.json(msg);
}

export function fireEventMiddleware(req: IRequest, res: IResponse, next: NextFn) {
    req.app.fireEvent(Events.RequestInit, req, res);
    next();
}

