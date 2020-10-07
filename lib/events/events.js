"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
const index_1 = require("@appolo/events/index");
class Events {
    constructor() {
        this.routeAdded = new index_1.Event();
        this.serverClosed = new index_1.Event();
    }
}
exports.Events = Events;
//# sourceMappingURL=events.js.map