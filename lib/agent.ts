import {IOptions} from "./IOptions";
import {Methods, Router} from 'appolo-route';
import {IRequest} from "./request";
import {Arrays, Enums, Promises,Objects} from "appolo-utils";
import {Util} from "./util";
import {
    Hooks,
    IHook, IHooks,
    IRouteHandler, MiddlewareHandlerData, MiddlewareHandler, MiddlewareHandlerError,
    MiddlewareHandlerErrorOrAny,
    MiddlewareHandlerOrAny,
    MiddlewareHandlerParams
} from "./types";
import {Server} from "./server";
import {
    errorMiddleware,
    fireEventMiddleware,
    handleMiddleware,
    handleMiddlewareError,
    notFoundMiddleware
} from "./middleware";
import {EventDispatcher} from "appolo-event-dispatcher";
import {View} from "./view";
import {IApp} from "./IApp";
import {Events} from "./events";
import {Defaults} from "./defaults";
import {IEventOptions} from "appolo-event-dispatcher/lib/IEventOptions";
import    http = require('http');
import    https = require('https');
import    url = require('url');
import    qs = require('qs');
import    querystring = require('querystring');
import {sendMiddleware} from "./response";

export class Agent extends EventDispatcher implements IApp {

    private _middlewares: MiddlewareHandlerOrAny[];
    private _middlewaresNotFound: MiddlewareHandlerOrAny[];
    private _middlewaresError: MiddlewareHandlerErrorOrAny[];
    private _hooks: IHooks = {};

    private _server: http.Server | https.Server;
    private _router: Router;
    private _view: View;
    private _options: IOptions;
    private _qsParse: (path: string) => any;
    private _urlParse: (path: string) => ({ query: string, pathname?: string });
    private _requestApp: IApp & { $view?: View };
    private _routes: Map<string, IRouteHandler>;
    private _isInitialized: boolean = false;


    public constructor(options?: IOptions) {

        super();

        this._options = Objects.defaults(options || {}, Defaults);

        this._qsParse = this._options.qsParser === "qs" ? qs.parse : querystring.parse;
        this._urlParse = this._options.urlParser === "fast" ? Util.parseUrlFast : url.parse;

        this._middlewares = [];
        this._middlewaresError = [];
        this._routes = new Map();

        this._router = new Router({
            useCache: this._options.useRouteCache,
            maxCacheSize: this._options.maxRouteCache,
            decodeUrlParams: this._options.decodeUrlParams
        });

        Enums.enumValues<Hooks>(Hooks).forEach(hook => this._hooks[hook] = []);

        this._view = new View(this._options);


        this._server = Server.createServer(this);

        this._requestApp = this;
        this._requestApp.$view = this._view;
    }

    private _initialize() {

        if (this._isInitialized) {
            return;
        }

        if (this.options.fireRequestEvents) {
            this._middlewares.push(fireEventMiddleware)
        }

        this._middlewaresError.push(errorMiddleware);

        this._middlewaresNotFound = [...this._middlewares, notFoundMiddleware];

        for (let handler of this._routes.values()) {
            this._initializeHandler(handler);
        }

        this._isInitialized = true;
    }

    private _initializeHandler(handler: IRouteHandler) {

        Object.keys(this._hooks).forEach(hookName =>
            handler.hooks[hookName] = [...this._hooks[hookName], ...(handler.hooks[hookName] || [])]);

        if (handler.hooks.onSend.length) {
            handler.hooks.onSend.push(function (data, req, res, next) {
                res.send(data)
            });
        }

        handler.middlewares = [
            ...handler.hooks.onRequest as MiddlewareHandlerOrAny[],
            ...this._middlewares,
            ...handler.hooks.preMiddleware as MiddlewareHandlerOrAny[],
            ...handler.middlewares.slice(0, -1),
            ...handler.hooks.preHandler as MiddlewareHandlerOrAny[],
            handler.middlewares[handler.middlewares.length - 1]
        ];
        handler.errors = [
            ...handler.hooks.onError,
            ...handler.errors,
            ...this._middlewaresError];

        handler.hasResponseHook = !!handler.hooks.onResponse.length;
        handler.hasSendHook = !!handler.hooks.onSend.length
    }

    public set requestApp(app: IApp) {
        this._requestApp = app;
        this._requestApp.$view = this._view;
    }

    public addHook(name: Hooks.OnError, ...hook: MiddlewareHandlerError[]): this
    public addHook(name: Hooks.OnResponse | Hooks.PreMiddleware | Hooks.PreHandler | Hooks.OnRequest, ...hook: MiddlewareHandler[]): this
    public addHook(name: Hooks.OnSend, ...hook: MiddlewareHandlerData[]): this
    public addHook(name: Hooks, ...hook: IHook[]): this {

        this._hooks[name].push(...hook);

        return this
    }

    public handle = (request: http.IncomingMessage, response: http.ServerResponse) => {
        let $self = this, req: IRequest = request as any, res = response as any;
        try {

            let {query, pathname} = $self._urlParse(req.url);

            res.req = req;
            req.query = query.length ? $self._qsParse(query) : {};
            req.pathName = pathname;
            req.originUrl = req.url;
            req.app = $self._requestApp;

            let route = this._router.find(req.method as Methods, req.pathName);

            if (!route) {
                handleMiddleware(req, res, this._middlewaresNotFound, this._middlewaresError);
                return;
            }

            let handler: IRouteHandler = route.handler;

            if (handler.hasSendHook) {
                res.send = sendMiddleware.bind(res, handler.hooks.onSend, this._middlewaresError)
            }

            if (handler.hasResponseHook) {
                response.once("finish", function () {
                    handleMiddleware(req, res, handler.hooks.onResponse, []);
                })
            }

            req.params = route.params;
            req.route = handler.route;

            handleMiddleware(req, res, handler.middlewares, handler.errors);

        } catch (e) {
            handleMiddlewareError(req, res, this._middlewaresError, e);
        }
    };

    public get options(): IOptions {
        return this._options;
    }

    public get(path: string, ...handler: MiddlewareHandlerParams[]): this {

        return this.add(Methods.GET, path, handler);
    }

    public post(path: string, ...handler: MiddlewareHandlerParams[]): this {
        return this.add(Methods.POST, path, handler);
    }

    public put(path: string, ...handler: MiddlewareHandlerParams[]): this {
        return this.add(Methods.PUT, path, handler);
    }

    public patch(path: string, ...handler: MiddlewareHandlerParams[]): this {
        return this.add(Methods.PATCH, path, handler);
    }

    public delete(path: string, ...handler: MiddlewareHandlerParams[]): this {
        return this.add(Methods.DELETE, path, handler);
    }

    public head(path: string, ...handler: MiddlewareHandlerParams[]): this {
        return this.add(Methods.HEAD, path, handler);
    }

    public all(path: string, ...handler: MiddlewareHandlerParams[]): this {
        this.add(Methods.GET, path, handler)
            .add(Methods.PATCH, path, handler)
            .add(Methods.POST, path, handler)
            .add(Methods.PUT, path, handler)
            .add(Methods.DELETE, path, handler)
            .add(Methods.HEAD, path, handler);

        return this;
    }

    public add(method: keyof typeof Methods, path: string, handlers: MiddlewareHandlerParams[], route?: any, hooks?: IHooks): this {

        handlers = Arrays.flat<MiddlewareHandlerParams>(handlers.map(handler => Array.isArray(handler) ? handler : [handler]));

        let result = Arrays.partition(handlers, handler => handler.length <= 3);

        let middlewares = result[0] as MiddlewareHandlerOrAny[];
        let errors = result[1] as MiddlewareHandlerErrorOrAny[];

        let dto = this._addRouteToRouter(method, path, middlewares, errors, route, hooks);

        if (method != Methods.HEAD) {
            this._addRouteToRouter(Methods.HEAD, path, middlewares.slice(), errors.slice(), route, hooks);
        }

        if (method != Methods.OPTIONS) {
            this._addRouteToRouter(Methods.OPTIONS, path, middlewares.slice(0, -1), errors.slice(), route, hooks);
        }

        this._requestApp.fireEvent(Events.RouteAdded, method, path, dto);
        return this;
    }

    private _addRouteToRouter(method: keyof typeof Methods, path: string, middlewares: MiddlewareHandlerOrAny[], errors: MiddlewareHandlerErrorOrAny[], route: any, hooks: IHooks): IRouteHandler {

        let dto: IRouteHandler = {
            middlewares,
            errors,
            route,
            method,
            path,
            hooks: hooks || {}
        };

        let routeKey = `${method}#${path}`;

        let routeHandler = this._routes.get(routeKey);

        if (routeHandler) {
            routeHandler.errors.push(...errors);
            routeHandler.middlewares.push(...middlewares);
        } else {
            this._router.add(method, path, dto);
            this._routes.set(routeKey, dto);
        }


        if (this._isInitialized) {
            this._initializeHandler(dto);
        }

        return dto;
    }

    public use(path?: string | MiddlewareHandlerParams, ...fn: MiddlewareHandlerParams[]): this {

        if (typeof path === "string") {
            return this.all(path, ...fn)
        } else {
            fn.unshift(path)
        }

        let result = Arrays.partition(fn, handler => handler.length <= 3);

        if (result[0].length) {
            this._middlewares.push(...result[0] as MiddlewareHandlerOrAny[]);
        }

        if (result[1].length) {
            this._middlewaresError.push(...result[1]);
        }

        return this
    }

    error(...fn: MiddlewareHandlerErrorOrAny[]): this {
        this._middlewaresError.push(...fn);
        return this
    }

    public get server(): http.Server | https.Server {
        return this._server
    }

    public get router(): Router {
        return this._router;
    }

    public async close(): Promise<void> {
        try {
            await Promises.fromCallback(c => this._server.close(c));
            this._requestApp.fireEvent(Events.ServerClosed);

        } catch (e) {
            if (e.message !== "Not running" && e.code !== "ERR_SERVER_NOT_RUNNING") {
                throw e;
            }
        }
    }

    public async listen(port: number, cb?: Function): Promise<Agent> {
        this._initialize();

        await Promises.fromCallback(c => this._server.listen(port, c as any));

        (cb) && cb(this);

        return this;
    }

    public on(event: Events | string, fn: (...args: any[]) => any, scope?: any, options?: IEventOptions): void {
        return super.on(event.toString(), fn, scope, options)
    }

    public once(event: Events | string, fn?: (...args: any[]) => any, scope?: any): Promise<any> | void {
        return super.once(event.toString(), fn, scope);
    }

    public decorate(fn: (req: http.IncomingMessage, res: http.ServerResponse, app: IApp) => void) {
        fn(http.IncomingMessage.prototype, http.ServerResponse.prototype, this._requestApp.constructor.prototype)
    }
}
