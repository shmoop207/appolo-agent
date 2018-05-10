"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(status, message, error, data, code) {
        super(message);
        this.status = status;
        this.error = error;
        this.data = data;
        this.code = code;
        this.statusCode = status;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=httpError.js.map