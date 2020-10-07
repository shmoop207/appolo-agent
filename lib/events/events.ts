import {Event, IEvent} from "@appolo/events/index";
import {RouteAddedEvent} from "../IApp";

export class Events {
    public readonly routeAdded: IEvent<RouteAddedEvent> = new Event();
    public readonly serverClosed: IEvent<void> = new Event();
}
