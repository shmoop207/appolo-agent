import {IOptions} from "./IOptions";
import {Methods, Router} from 'appolo-route';
import {IRequest} from "./request";
import {IResponse} from "./response";
import {HttpError} from "./errors/httpError";
import {Util} from "./util";
import {MiddlewareHandler, MiddlewareHandlerAny, MiddlewareHandlerParams, NextFn} from "./types";
import {ErrorHandler} from "./errorHandler";
import {Server} from "./server";
import {handleMiddleware} from "./middleware";
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

    private _middlewares: MiddlewareHandler[];
    private _server: http.Server | https.Server;
    private _router: Router;
    private _view: View;
    private _options: IOptions;
    private _qsParse: (path: string) => any;
    private _urlParse: (path: string) => ({ query: string, pathname?: string });
    private _requestApp: IApp & { $view?: View };


    public constructor(options?: IOptions) {

        super();

        this._options = _.defaults(options || {}, Defaults);

        this._qsParse = this._options.qsParser === "qs" ? qs.parse : querystring.parse;
        this._urlParse = this._options.urlParser === "fast" ? Util.parseUrlFast : url.parse;

        this._middlewares = [];

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

        if (this.options.fireRequestEvents) {
            this._middlewares.push((req, res, next) => {
                this._requestApp.fireEvent(Events.RequestInit, req, res);
                next();
            })
        }

        this._middlewares.push(this._initRoute);

    }

    public set requestApp(app: IApp) {
        this._requestApp = app;
        this._requestApp.$view = this._view;
    }


    public handle = (request: http.IncomingMessage, response: http.ServerResponse) => {

        try {
            this._initRequest(request as any, response  as any);

            handleMiddleware(request  as any, response  as any, 0, this._middlewares);

        } catch (e) {
            ErrorHandler.handleError(e, response  as any);
        }
    };

    private _initRequest(req: IRequest, res: IResponse): void {

        let $self = this;
        let {query, pathname} = $self._urlParse(req.url);


        res.req = req;
        req.query = query.length ? $self._qsParse(query) : {};
        req.pathName = pathname;
        req.originUrl = req.url;
        req.app = $self._requestApp;

    }

    private _initRoute = (req: IRequest, res: IResponse, next: NextFn): void => {

        let route = this._router.find(req.method as Methods, req.pathName);

        if (!route) {
            next(new HttpError(404, `Cannot ${req.method} ${req.pathName}`));
            return;
        }

        req.params = route.params;
        req.route = route.handler.route;
        handleMiddleware(req, res, 0, route.handler.handlers);
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

        let dtoHandlers = _(handlers).map(handler => _.isArray(handler) ? handler : [handler]).flatten().value();

        this._router.add(method, path, {handlers: dtoHandlers, route});
        if (method != Methods.HEAD) {
            this._router.add(Methods.HEAD, path, {handlers: dtoHandlers, route});
        }

        this._requestApp.fireEvent(Events.RouteAdded, method, path, {handlers: dtoHandlers, route});
        return this;
    }

    public use(fn: MiddlewareHandler | MiddlewareHandlerAny): this {
        this._middlewares.push(fn);

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