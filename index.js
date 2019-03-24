"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("./lib/agent");
var agent_2 = require("./lib/agent");
exports.Agent = agent_2.Agent;
var httpError_1 = require("./lib/errors/httpError");
exports.HttpError = httpError_1.HttpError;
var badRequestError_1 = require("./lib/errors/badRequestError");
exports.BadRequestError = badRequestError_1.BadRequestError;
var internalServerError_1 = require("./lib/errors/internalServerError");
exports.InternalServerError = internalServerError_1.InternalServerError;
var unauthorizedError_1 = require("./lib/errors/unauthorizedError");
exports.UnauthorizedError = unauthorizedError_1.UnauthorizedError;
var notFoundError_1 = require("./lib/errors/notFoundError");
exports.NotFoundError = notFoundError_1.NotFoundError;
var request_1 = require("./lib/request");
exports.Request = request_1.Request;
var response_1 = require("./lib/response");
exports.Response = response_1.Response;
var events_1 = require("./lib/events");
exports.Events = events_1.Events;
var appolo_route_1 = require("appolo-route");
exports.Methods = appolo_route_1.Methods;
var types_1 = require("./lib/types");
exports.Hooks = types_1.Hooks;
function createAgent(options) {
    return new agent_1.Agent(options);
}
exports.createAgent = createAgent;
function default_1(options) {
    return new agent_1.Agent(options);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map