import {IEventDispatcher} from "appolo-event-dispatcher";
import {IOptions} from "./IOptions";

export interface IApp extends IEventDispatcher {
    options: IOptions
}