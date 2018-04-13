import {IResponse} from "./response";
import {IOptions} from "./IOptions";

export interface IApp {
    render(path: string | string[], params?: any, res?: IResponse): Promise<string>

    options: IOptions
}