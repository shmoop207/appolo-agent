import {IResponse} from "./response";
import {IRequest} from "./request";
import {MiddlewareHandler} from "./types";
import {ErrorHandler} from "./errorHandler";


export function handleMiddleware(req: IRequest, res: IResponse, num: number, middlewares: MiddlewareHandler[], err?: Error) {

    if (err) {
        return ErrorHandler.handleError(err, res);
    }

    let fn = middlewares[num];

    if (!fn) {
        return;
    }

    let next = function (err) {
        handleMiddleware(req, res, num + 1, middlewares, err)
    };
    req.next = next;

    try {
        fn(req, res, next);
    } catch (e) {
        ErrorHandler.handleError(e, res);
    }

}