"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("./lib/agent");
var agent_2 = require("./lib/agent");
exports.Agent = agent_2.Agent;
var appolo_route_1 = require("appolo-route");
exports.Methods = appolo_route_1.Methods;
function createAgent(options) {
    return new agent_1.Agent(options);
}
exports.createAgent = createAgent;
function default_1(options) {
    return new agent_1.Agent(options);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map