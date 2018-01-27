import {Cache} from "rocket-lru";
import fs = require("fs");
import _ = require("lodash");
import path = require("path");
import Q = require("bluebird");
import {IOptions} from "./IOptions";
import {HttpError} from "./httpError";

export class View {

    private _cache: Cache<string, { path: string }>;
    private _options: IOptions;

    constructor(_options: IOptions) {
        this._options = _options;
        this._cache = new Cache({maxSize: this._options.maxRouteCache});
    }

    public async render(paths: string[], params: any): Promise<string> {

        try {

            params = params || {};

            let item: { path: string } = null;

            for (let i = 0, len = paths.length; i < len; i++) {
                item = this._cache.peek(paths[i]);
                if (item) {
                    break;
                }
            }

            if (!item) {
                item = await  this._findPath(paths);
            }

            let result = await this._options.viewEngine(item.path, {cache: true, ...params});

            return result;


        } catch (e) {
            throw new HttpError(500, `failed to render view ${e.toString()}`)
        }

    }

    private async _findPath(paths:string[]):Promise<{path: string}>{
        let lookPaths = [];

        _.forEach(paths, p => {
            let ext = path.extname(p);

            if (!ext) {
                p += `.${this._options.viewExt || "html"}`;
            }

            lookPaths.push(path.resolve(process.cwd(), p));
            lookPaths.push(path.resolve(process.cwd(), this._options.viewFolder, p));
        });

        let foundPath = await this._lookup(paths.slice());

        if (!foundPath) {
            throw new HttpError(500, `failed to find view path for ${name}  searched paths ${JSON.stringify(paths)}`)
        }

        if (!this._options.viewEngine) {
            throw new HttpError(500, `tried to call render but view engine is no defined`)
        }

        let item = {path: foundPath};

        this._cache.set(foundPath, item);

        return item;
    }

    private async _lookup(paths: string[]): Promise<string> {

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

    private async _isFileExist(path: string): Promise<boolean> {

        try {
            let result: fs.Stats = await Q.fromCallback(c => fs.stat(path, c));
            return result.isFile();
        } catch (e) {
            return false;
        }
    }
}

