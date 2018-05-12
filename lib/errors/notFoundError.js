"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpError_1 = require("./httpError");
class NotFoundError extends httpError_1.HttpError {
    constructor(error, data, code) {
        super(404, "Not Found", error, data, code);
        this.error = error;
        this.data = data;
        this.code = code;
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=notFoundError.js.map