"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("./errorHandler");
function handleMiddleware(req, res, num, middlewares, err) {
    if (err) {
        return errorHandler_1.ErrorHandler.handleError(err, res);
    }
    let fn = middlewares[num];
    if (!fn) {
        return;
    }
    let next = function (err) { handleMiddleware(req, res, num + 1, middlewares, err); };
    req.next = next;
    //try {
    fn(req, res, next);
    //} catch (e) {
    //    ErrorHandler.handleError(e, res);
    //}
}
exports.handleMiddleware = handleMiddleware;
//# sourceMappingURL=middleware.js.map