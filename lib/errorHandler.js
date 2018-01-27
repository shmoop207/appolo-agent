"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpError_1 = require("./httpError");
class ErrorHandler {
    static handleError(e, res) {
        let err = e || new httpError_1.HttpError(500);
        res.statusCode = ErrorHandler.getStatusCode(err);
        let options = res.req.app.options;
        let msg = ErrorHandler.getErrorMessage(err, res.statusCode, options.errorStack, options.errorMessage);
        res.send(msg);
    }
    static getStatusCode(err) {
        if ((err.status >= 400 && err.status < 600)) {
            return err.status;
        }
        if (err.statusCode >= 400 && err.statusCode < 600) {
            return err.statusCode;
        }
        return 500;
    }
    static getErrorMessage(e, statusCode, errorStack, errorMessage) {
        if (e instanceof httpError_1.HttpError && e.data) {
            return e.data;
        }
        if (statusCode == 500 || errorStack) {
            return e.stack;
        }
        if (e.toString && errorMessage) {
            return e.toString();
        }
        return statusCode.toString();
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map