"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hooks = void 0;
const types_1 = require("../types");
const index_1 = require("@appolo/utils/index");
class Hooks {
    constructor() {
        this._hooks = {};
        index_1.Enums.enumValues(types_1.HooksTypes).forEach(hook => this._hooks[hook] = []);
    }
    get hooks() {
        return this._hooks;
    }
    onError(...hook) {
        this._hooks[types_1.HooksTypes.OnError].push(...hook);
        return this;
    }
    onRequest(...hook) {
        this._hooks[types_1.HooksTypes.OnRequest].push(...hook);
        return this;
    }
    onPreMiddleware(...hook) {
        this._hooks[types_1.HooksTypes.PreMiddleware].push(...hook);
        return this;
    }
    onPreHandler(...hook) {
        this._hooks[types_1.HooksTypes.PreHandler].push(...hook);
        return this;
    }
    onResponse(...hook) {
        this._hooks[types_1.HooksTypes.OnResponse].push(...hook);
        return this;
    }
    onSend(...hook) {
        this._hooks[types_1.HooksTypes.OnSend].push(...hook);
        return this;
    }
}
exports.Hooks = Hooks;
//# sourceMappingURL=hooks.js.map