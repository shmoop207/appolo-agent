import {HttpError} from "./errors/httpError";
import {Objects} from "appolo-utils";

export class ErrorHandler {

    public static getStatusCode(err: HttpError): number {

        if ((err.status >= 400 && err.status < 600)) {
            return err.status
        }

        if (err.statusCode >= 400 && err.statusCode < 600) {
            return err.statusCode;
        }

        return 500;
    }

    public static getErrorMessage(e: Error | HttpError, statusCode: number): { message: string, statusCode: number, code?: number, error?: string } {

        let dto: { message: string, statusCode: number, code?: number, error?: string } = {
            statusCode: statusCode,
            message: e.toString()
        };

        if (e instanceof HttpError) {

            if (Objects.isPlain(e.data)) {
                Object.assign(dto, e.data)
            }

            dto.message = e.message;

            if (e.code) {
                dto.code = e.code
            }

            if (e.error) {
                dto.error = (e.error as Error).message || e.error.toString();

                if ((e.error as HttpError).code && !dto.code) {
                    dto.code = (e.error as HttpError).code
                }
            }
        }

        return dto

    }
}
