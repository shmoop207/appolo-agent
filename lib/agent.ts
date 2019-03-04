import {IOptions} from "./IOptions";
import {Methods, Router} from 'appolo-route';
import {IRequest} from "./request";
import {Util} from "./util";
import {IRouteHandler, MiddlewareHandlerErrorOrAny, MiddlewareHandlerOrAny, MiddlewareHandlerParams} from "./types";
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
import    _ = require('lodash');
import    url = require('url');
import    qs = require('qs');
import    Q = require('bluebird');
import    querystring = require('querystring');

export class Agent extends EventDispatcher implements IApp {

    private _middlewares: MiddlewareHandlerOrAny[];
    private _middlewaresNotFound: MiddlewareHandlerOrAny[];
    private _middlewaresError: MiddlewareHandlerErrorOrAny[];
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

        this._options = _.defaults(options || {}, Defaults);

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
        handler.middlewares = [...this._middlewares, ...handler.middlewares];
        handler.errors = [...handler.errors, ...this._middlewaresError];
    }

    public set requestApp(app: IApp) {
        this._requestApp = app;
        this._requestApp.$view = this._view;
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

    public add(method: keyof typeof Methods, path: string, handlers: MiddlewareHandlerParams[], route?: any): this {

        handlers = _(handlers).map(handler => _.isArray(handler) ? handler : [handler]).flatten().value();

        let result = _.partition(handlers, handler => handler.length <= 3);

        let middlewares = result[0] as MiddlewareHandlerOrAny[];
        let errors = result[1] as MiddlewareHandlerErrorOrAny[];

        let dto = this._addRouteToRouter(method, path, middlewares, errors, route);

        if (method != Methods.HEAD) {
            this._addRouteToRouter(Methods.HEAD, path, middlewares.slice(), errors.slice(), route);
        }

        if (method != Methods.OPTIONS) {
            this._addRouteToRouter(Methods.OPTIONS, path, middlewares.slice(0, -1), errors.slice(), route);
        }

        this._requestApp.fireEvent(Events.RouteAdded, method, path, dto);
        return this;
    }

    private _addRouteToRouter(method: keyof typeof Methods, path: string, middlewares: MiddlewareHandlerOrAny[], errors: MiddlewareHandlerErrorOrAny[], route: any): IRouteHandler {
        let dto: IRouteHandler = {middlewares, errors, route, method, path};

        this._router.add(method, path, dto);
        this._routes.set(`${method}#${path}`, dto);

        if (this._isInitialized) {
            this._initializeHandler(dto);
        }

        return dto;
    }

    public use(...fn: MiddlewareHandlerParams[]): this {

        let result = _.partition(fn, handler => handler.length <= 3);

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
            await Q.fromCallback(c => this._server.close(c));
            this._requestApp.fireEvent(Events.ServerClosed);

        } catch (e) {
            if (e.message !== "Not running" && e.code !== "ERR_SERVER_NOT_RUNNING") {
                throw e;
            }
        }
    }

    public async listen(port: number, cb?: Function): Promise<Agent> {
        this._initialize();

        await Q.fromCallback(c => this._server.listen(port, c));

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