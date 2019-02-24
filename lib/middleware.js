"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpError_1 = require("./errors/httpError");
const errorHandler_1 = require("./errorHandler");
const events_1 = require("./events");
function handleMiddleware(req, res, num, middlewares, errorsMiddleware, err) {
    if (err) {
        return handleMiddlewareError(req, res, 0, errorsMiddleware, err);
    }
    if (num == middlewares.length) {
        return;
    }
    let fn = middlewares[num];
    let next = req.next = function (err) {
        if (!next.run) {
            next.run = true;
            handleMiddleware(req, res, num + 1, middlewares, errorsMiddleware, err);
        }
    };
    try {
        fn(req, res, next);
    }
    catch (e) {
        handleMiddlewareError(req, res, 0, errorsMiddleware, e);
    }
}
exports.handleMiddleware = handleMiddleware;
function handleMiddlewareError(req, res, num, middlewares, err) {
    if (num == middlewares.length) {
        return;
    }
    let fn = middlewares[num];
    let next = req.next = function (err) {
        if (!next.run) {
            next.run = true;
            handleMiddlewareError(req, res, num + 1, middlewares, err);
        }
    };
    try {
        fn(err, req, res, next);
    }
    catch (e) {
        next(e);
    }
}
exports.handleMiddlewareError = handleMiddlewareError;
function notFoundMiddleware(req, res, next) {
    next(new httpError_1.HttpError(404, `Cannot ${req.method} ${req.pathName}`));
}
exports.notFoundMiddleware = notFoundMiddleware;
function errorMiddleware(e, req, res, next) {
    if (res.headersSent || res.sending) {
        return;
    }
    let err = e || new httpError_1.HttpError(500);
    res.statusCode = errorHandler_1.ErrorHandler.getStatusCode(err);
    //let options = res.req.app.options;
    let msg = errorHandler_1.ErrorHandler.getErrorMessage(err, res.statusCode);
    res.json(msg);
}
exports.errorMiddleware = errorMiddleware;
function fireEventMiddleware(req, res, next) {
    req.app.fireEvent(events_1.Events.RequestInit, req, res);
    next();
}
exports.fireEventMiddleware = fireEventMiddleware;
//# sourceMappingURL=middleware.js.map