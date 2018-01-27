import {IResponse} from "./response";
import {HttpError} from "./httpError";

export class ErrorHandler{
    public static handleError(e: Error | HttpError, res: IResponse) {

        let err: HttpError = e as HttpError || new HttpError(500);

        res.statusCode = ErrorHandler.getStatusCode(err);

        let options = res.req.app.options;

        let msg= ErrorHandler.getErrorMessage(err,res.statusCode,options.errorStack,options.errorMessage);

        res.send(msg);
    }

    private static getStatusCode(err: HttpError):number{

        if((err.status >= 400 && err.status < 600)){
            return err.status
        }

        if(err.statusCode >= 400 && err.statusCode < 600){
           return err.statusCode;
        }

        return 500;
    }

    private static getErrorMessage(e: Error | HttpError,statusCode:number,errorStack:boolean,errorMessage:boolean):string{

        if(e instanceof HttpError && e.data){
            return e.data;
        }

        if(statusCode == 500 || errorStack){
            return e.stack;
        }

        if(e.toString && errorMessage){
            return e.toString();
        }

        return statusCode.toString();

    }
}