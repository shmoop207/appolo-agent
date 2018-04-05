"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_cache_1 = require("appolo-cache");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const Q = require("bluebird");
const httpError_1 = require("./httpError");
class View {
    constructor(_options) {
        this._options = _options;
        this._cache = new appolo_cache_1.Cache({ maxSize: this._options.maxRouteCache });
    }
    render(paths, params) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                params = params || {};
                let item = null;
                for (let i = 0, len = paths.length; i < len; i++) {
                    item = this._cache.peek(paths[i]);
                    if (item) {
                        break;
                    }
                }
                if (!item) {
                    item = yield this._findPath(paths);
                }
                let result = yield this._options.viewEngine(item.path, Object.assign({ cache: true }, params));
                return result;
            }
            catch (e) {
                throw new httpError_1.HttpError(500, `failed to render view ${e.toString()}`);
            }
        });
    }
    _findPath(paths) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let lookPaths = [];
            _.forEach(paths, p => {
                let ext = path.extname(p);
                if (!ext) {
                    p += `.${this._options.viewExt || "html"}`;
                }
                lookPaths.push(path.resolve(process.cwd(), p));
                lookPaths.push(path.resolve(process.cwd(), this._options.viewFolder, p));
            });
            let foundPath = yield this._lookup(paths.slice());
            if (!foundPath) {
                throw new httpError_1.HttpError(500, `failed to find view path for ${name}  searched paths ${JSON.stringify(paths)}`);
            }
            if (!this._options.viewEngine) {
                throw new httpError_1.HttpError(500, `tried to call render but view engine is no defined`);
            }
            let item = { path: foundPath };
            this._cache.set(foundPath, item);
            return item;
        });
    }
    _lookup(paths) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let path = paths.shift();
            if (!path) {
                return null;
            }
            let isExist = yield this._isFileExist(path);
            if (isExist) {
                return path;
            }
            return this._lookup(paths);
        });
    }
    _isFileExist(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield Q.fromCallback(c => fs.stat(path, c));
                return result.isFile();
            }
            catch (e) {
                return false;
            }
        });
    }
}
exports.View = View;
//# sourceMappingURL=view.js.map