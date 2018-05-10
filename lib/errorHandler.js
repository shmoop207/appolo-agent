"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpError_1 = require("./errors/httpError");
const _ = require("lodash");
class ErrorHandler {
    static handleError(e, res) {
        let err = e || new httpError_1.HttpError(500);
        res.statusCode = ErrorHandler.getStatusCode(err);
        //let options = res.req.app.options;
        let msg = ErrorHandler.getErrorMessage(err, res.statusCode);
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
    static getErrorMessage(e, statusCode) {
        let dto = {
            statusCode: statusCode,
            message: e.toString()
        };
        if (e instanceof httpError_1.HttpError) {
            if (_.isPlainObject(e.data)) {
                _.extend(dto, e.data);
            }
            dto.message = e.message;
            if (e.code) {
                dto.code = e.code;
            }
            if (e.error) {
                dto.error = e.error.toString();
            }
        }
        return dto;
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map