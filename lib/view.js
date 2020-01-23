"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_cache_1 = require("appolo-cache");
const httpError_1 = require("./errors/httpError");
const appolo_utils_1 = require("appolo-utils");
const fs = require("fs");
const path = require("path");
class View {
    constructor(_options) {
        this._options = _options;
        this._cache = new appolo_cache_1.Cache({ maxSize: this._options.maxRouteCache });
    }
    async render(paths, params, res) {
        try {
            params = params || {};
            let pathsKey = paths.toString();
            let item = null;
            if (res) {
                item = this._cache.peek(pathsKey);
            }
            if (!item) {
                item = await this._findPath(paths);
            }
            if (res) {
                this._cache.set(pathsKey, item);
            }
            let result = await this._options.viewEngine(item.path, Object.assign({ cache: this._options.viewCache }, params));
            return result;
        }
        catch (e) {
            throw new httpError_1.HttpError(500, `failed to render view ${e.toString()}`);
        }
    }
    async _findPath(paths) {
        let lookPaths = [];
        for (let i = 0, len = paths.length; i < len; i++) {
            let p = paths[i];
            let ext = path.extname(p);
            if (!ext) {
                p += `.${this._options.viewExt || "html"}`;
            }
            lookPaths.push(path.resolve(process.cwd(), p));
            lookPaths.push(path.resolve(process.cwd(), this._options.viewFolder, p));
        }
        let foundPath = await this._lookup(lookPaths.slice());
        if (!foundPath) {
            throw new httpError_1.HttpError(500, `failed to find view path searched paths ${JSON.stringify(lookPaths)}`);
        }
        if (!this._options.viewEngine) {
            throw new httpError_1.HttpError(500, `tried to call render but view engine is no defined`);
        }
        let item = { path: foundPath };
        return item;
    }
    async _lookup(paths) {
        let path = paths.shift();
        if (!path) {
            return null;
        }
        let isExist = await this._isFileExist(path);
        if (isExist) {
            return path;
        }
        return this._lookup(paths);
    }
    async _isFileExist(path) {
        try {
            let result = await appolo_utils_1.Util.promises.fromCallback(c => fs.stat(path, c));
            return result.isFile();
        }
        catch (e) {
            return false;
        }
    }
}
exports.View = View;
//# sourceMappingURL=view.js.map