export class HttpError extends Error {

    public statusCode: number;

    constructor(public status: number, message?: string, public error?: string | Error, public data?: any, public code?: number) {
        super(message);

        this.statusCode = status;

        Object.setPrototypeOf(this, HttpError.prototype);

    }
}