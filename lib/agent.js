"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_route_1 = require("appolo-route");
const request_1 = require("./request");
const response_1 = require("./response");
const httpError_1 = require("./errors/httpError");
const util_1 = require("./util");
const errorHandler_1 = require("./errorHandler");
const server_1 = require("./server");
const middleware_1 = require("./middleware");
const appolo_event_dispatcher_1 = require("appolo-event-dispatcher");
const view_1 = require("./view");
const events_1 = require("./events");
const defaults_1 = require("./defaults");
const http = require("http");
const _ = require("lodash");
const url = require("url");
const qs = require("qs");
const Q = require("bluebird");
const querystring = require("querystring");
class Agent extends appolo_event_dispatcher_1.EventDispatcher {
    constructor(options) {
        super();
        this.handle = (request, response) => {
            let req = request_1.createRequest(request), res = response_1.createResponse(request, response);
            try {
                this._initRequest(req, res);
                middleware_1.handleMiddleware(req, res, 0, this._middlewares);
            }
            catch (e) {
                errorHandler_1.ErrorHandler.handleError(e, res);
            }
        };
        this._initRoute = (req, res, next) => {
            let route = this._router.find(req.method, req.pathName);
            if (!route) {
                next(new httpError_1.HttpError(404, `Cannot ${req.method} ${req.pathName}`));
                return;
            }
            req.params = route.params;
            req.route = route.handler.route;
            middleware_1.handleMiddleware(req, res, 0, route.handler.handlers);
        };
        this._options = _.defaults(options || {}, defaults_1.Defaults);
        this._qsParse = this._options.qsParser === "qs" ? qs.parse : querystring.parse;
        this._urlParse = this._options.urlParser === "fast" ? util_1.Util.parseUrlFast : url.parse;
        this._middlewares = [];
        this._router = new appolo_route_1.Router({
            useCache: this._options.useRouteCache,
            maxCacheSize: this._options.maxRouteCache,
            decodeUrlParams: this._options.decodeUrlParams
        });
        this._view = new view_1.View(this._options);
        this._server = server_1.Server.createServer(this);
        this._requestApp = this;
    }
    _initialize() {
        this._middlewares.push(this._initRoute);
    }
    set requestApp(app) {
        this._requestApp = app;
    }
    _initRequest(req, res) {
        let { query, pathname } = this._urlParse(req.url);
        req.query = query.length ? this._qsParse(query) : {};
        req.pathName = pathname;
        req.originUrl = req.url;
        req.app = this._requestApp;
        req.view = this._view;
        this._requestApp.fireEvent(events_1.Events.RequestInit, req, res);
    }
    get options() {
        return this._options;
    }
    get(path, ...handler) {
        return this.add(appolo_route_1.Methods.GET, path, handler);
    }
    post(path, ...handler) {
        return this.add(appolo_route_1.Methods.POST, path, handler);
    }
    put(path, ...handler) {
        return this.add(appolo_route_1.Methods.PUT, path, handler);
    }
    patch(path, ...handler) {
        return this.add(appolo_route_1.Methods.PATCH, path, handler);
    }
    delete(path, ...handler) {
        return this.add(appolo_route_1.Methods.DELETE, path, handler);
    }
    head(path, ...handler) {
        return this.add(appolo_route_1.Methods.HEAD, path, handler);
    }
    add(method, path, handlers, route) {
        let dtoHandlers = _(handlers).map(handler => _.isArray(handler) ? handler : [handler]).flatten().value();
        this._router.add(method, path, { handlers: dtoHandlers, route });
        if (method != appolo_route_1.Methods.HEAD) {
            this._router.add(appolo_route_1.Methods.HEAD, path, { handlers: dtoHandlers, route });
        }
        this._requestApp.fireEvent(events_1.Events.RouteAdded, method, path, { handlers: dtoHandlers, route });
        return this;
    }
    use(fn) {
        this._middlewares.push(fn);
        return this;
    }
    get server() {
        return this._server;
    }
    get router() {
        return this._router;
    }
    async close() {
        try {
            await Q.fromCallback(c => this._server.close(c));
            this._requestApp.fireEvent(events_1.Events.ServerClosed);
        }
        catch (e) {
            if (e.message !== "Not running" && e.code !== "ERR_SERVER_NOT_RUNNING") {
                throw e;
            }
        }
    }
    async listen(port, cb) {
        this._initialize();
        await Q.fromCallback(c => this._server.listen(port, c));
        (cb) && cb(this);
        return this;
    }
    on(event, fn, scope, once) {
        return super.on(event.toString(), fn, scope, once);
    }
    once(event, fn, scope) {
        return super.once(event.toString(), fn, scope);
    }
    decorate(fn) {
        fn(http.IncomingMessage.prototype, http.ServerResponse.prototype, this._requestApp.constructor.prototype);
    }
}
exports.Agent = Agent;
//# sourceMappingURL=agent.js.map