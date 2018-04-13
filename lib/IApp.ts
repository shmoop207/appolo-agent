import {IResponse} from "./response";

export interface IApp {
    render(path: string | string[], params?: any,res?:IResponse): Promise<string>
}