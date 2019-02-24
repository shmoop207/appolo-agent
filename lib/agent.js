"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_route_1 = require("appolo-route");
const util_1 = require("./util");
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
        this._isInitialized = false;
        this.handle = (request, response) => {
            let $self = this, req = request, res = response;
            try {
                let { query, pathname } = $self._urlParse(req.url);
                res.req = req;
                req.query = query.length ? $self._qsParse(query) : {};
                req.pathName = pathname;
                req.originUrl = req.url;
                req.app = $self._requestApp;
                let route = this._router.find(req.method, req.pathName);
                if (!route) {
                    middleware_1.handleMiddleware(req, res, 0, this._middlewaresNotFound, this._middlewaresError);
                    return;
                }
                let handler = route.handler;
                req.params = route.params;
                req.route = handler.route;
                middleware_1.handleMiddleware(req, res, 0, handler.middlewares, handler.errors);
            }
            catch (e) {
                middleware_1.handleMiddlewareError(req, res, 0, this._middlewaresError, e);
            }
        };
        this._options = _.defaults(options || {}, defaults_1.Defaults);
        this._qsParse = this._options.qsParser === "qs" ? qs.parse : querystring.parse;
        this._urlParse = this._options.urlParser === "fast" ? util_1.Util.parseUrlFast : url.parse;
        this._middlewares = [];
        this._middlewaresError = [];
        this._routes = new Map();
        this._router = new appolo_route_1.Router({
            useCache: this._options.useRouteCache,
            maxCacheSize: this._options.maxRouteCache,
            decodeUrlParams: this._options.decodeUrlParams
        });
        this._view = new view_1.View(this._options);
        this._server = server_1.Server.createServer(this);
        this._requestApp = this;
        this._requestApp.$view = this._view;
    }
    _initialize() {
        if (this._isInitialized) {
            return;
        }
        if (this.options.fireRequestEvents) {
            this._middlewares.push(middleware_1.fireEventMiddleware);
        }
        this._middlewaresError.push(middleware_1.errorMiddleware);
        this._middlewaresNotFound = [...this._middlewares, middleware_1.notFoundMiddleware];
        for (let handler of this._routes.values()) {
            this._initializeHandler(handler);
        }
        this._isInitialized = true;
    }
    _initializeHandler(handler) {
        handler.middlewares = [...this._middlewares, ...handler.middlewares];
        handler.errors = [...handler.errors, ...this._middlewaresError];
    }
    set requestApp(app) {
        this._requestApp = app;
        this._requestApp.$view = this._view;
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
        handlers = _(handlers).map(handler => _.isArray(handler) ? handler : [handler]).flatten().value();
        let result = _.partition(handlers, handler => handler.length <= 3);
        let middlewares = result[0];
        let errors = result[1];
        let dto = this._addRouteToRouter(method, path, middlewares, errors, route);
        if (method != appolo_route_1.Methods.HEAD) {
            this._addRouteToRouter(appolo_route_1.Methods.HEAD, path, middlewares.slice(), errors.slice(), route);
        }
        if (method != appolo_route_1.Methods.OPTIONS) {
            this._addRouteToRouter(appolo_route_1.Methods.OPTIONS, path, middlewares.slice(0, -1), errors.slice(), route);
        }
        this._requestApp.fireEvent(events_1.Events.RouteAdded, method, path, dto);
        return this;
    }
    _addRouteToRouter(method, path, middlewares, errors, route) {
        let dto = { middlewares, errors, route, method, path };
        this._router.add(method, path, dto);
        this._routes.set(`${method}#${path}`, dto);
        if (this._isInitialized) {
            this._initializeHandler(dto);
        }
        return dto;
    }
    use(...fn) {
        let result = _.partition(fn, handler => handler.length <= 3);
        if (result[0].length) {
            this._middlewares.push(...result[0]);
        }
        if (result[1].length) {
            this._middlewaresError.push(...result[1]);
        }
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
    on(event, fn, scope, options) {
        return super.on(event.toString(), fn, scope, options);
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