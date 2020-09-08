import {IEventDispatcher} from "@appolo/events";
import {IOptions} from "./IOptions";

export interface IApp extends IEventDispatcher {
    options: IOptions
}
