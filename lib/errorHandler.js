"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const httpError_1 = require("./errors/httpError");
const utils_1 = require("@appolo/utils");
class ErrorHandler {
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
            if (utils_1.Objects.isPlain(e.data)) {
                Object.assign(dto, e.data);
            }
            dto.message = e.message;
            if (e.code) {
                dto.code = e.code;
            }
            if (e.error) {
                dto.error = e.error.message || e.error.toString();
                if (e.error.code && !dto.code) {
                    dto.code = e.error.code;
                }
            }
        }
        return dto;
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map