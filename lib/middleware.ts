import {IResponse} from "./response";
import {IRequest} from "./request";
import {MiddlewareHandler} from "./types";
import {ErrorHandler} from "./errorHandler";


export function handleMiddleware(req: IRequest, res: IResponse, num: number, middlewares: MiddlewareHandler[], err?: Error) {

    if (err) {
        return ErrorHandler.handleError(err, res);
    }

    if(num == middlewares.length){
        return;
    }

    let fn = middlewares[num];


    req.next =  function (err){
        handleMiddleware(req, res, num + 1, middlewares, err)
    };


    try {
        fn(req, res, req.next);
    } catch (e) {
        ErrorHandler.handleError(e, res);
    }

}