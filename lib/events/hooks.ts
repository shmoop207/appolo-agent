import {HooksTypes, IHook, IHooks, MiddlewareHandler, MiddlewareHandlerData, MiddlewareHandlerError} from "../types";
import {Enums} from "@appolo/utils/index";

export class Hooks {

    private _hooks: IHooks = {};

    constructor() {
        Enums.enumValues<HooksTypes>(HooksTypes).forEach(hook => this._hooks[hook] = []);

    }

    public get hooks():IHooks {
        return this._hooks;
    }

    public onError(...hook: MiddlewareHandlerError[]):this {
        this._hooks[HooksTypes.OnError].push(...hook);
        return this
    }

    public onRequest(...hook: MiddlewareHandler[]):this {
        this._hooks[HooksTypes.OnRequest].push(...hook);
        return this
    }

    public onPreMiddleware(...hook: MiddlewareHandler[]):this {
        this._hooks[HooksTypes.PreMiddleware].push(...hook);
        return this;
    }

    public onPreHandler(...hook: MiddlewareHandler[]):this {
        this._hooks[HooksTypes.PreHandler].push(...hook);
        return this
    }

    public onResponse(...hook: MiddlewareHandler[]):this {
        this._hooks[HooksTypes.OnResponse].push(...hook);
        return this
    }

    public onSend(...hook: MiddlewareHandlerData[]):this {
        this._hooks[HooksTypes.OnSend].push(...hook);
        return this
    }

}
