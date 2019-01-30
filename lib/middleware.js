"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("./errorHandler");
function handleMiddleware(req, res, num, middlewares, err) {
    if (err) {
        return errorHandler_1.ErrorHandler.handleError(err, res);
    }
    if (num == middlewares.length) {
        return;
    }
    let fn = middlewares[num];
    req.next = function (err) {
        handleMiddleware(req, res, num + 1, middlewares, err);
    };
    try {
        fn(req, res, req.next);
    }
    catch (e) {
        errorHandler_1.ErrorHandler.handleError(e, res);
    }
}
exports.handleMiddleware = handleMiddleware;
//# sourceMappingURL=middleware.js.map