import {Cache} from "appolo-cache";
import {IOptions} from "./IOptions";
import {HttpError} from "./errors/httpError";
import {IResponse} from "./response";
import {Util} from "appolo-utils";
import fs = require("fs");
import path = require("path");

export class View {

    private _cache: Cache<string, { path: string }>;
    private _options: IOptions;

    constructor(_options: IOptions) {
        this._options = _options;
        this._cache = new Cache({maxSize: this._options.maxRouteCache});
    }

    public async render(paths: string[], params: any, res: IResponse): Promise<string> {

        try {

            params = params || {};

            let pathsKey = paths.toString();

            let item: { path: string } = null;
            if (res) {
                item = this._cache.peek(pathsKey);
            }

            if (!item) {
                item = await this._findPath(paths);
            }
            if (res) {
                this._cache.set(pathsKey, item);
            }


            let result = await this._options.viewEngine(item.path, {cache: this._options.viewCache, ...params});

            return result;


        } catch (e) {
            throw new HttpError(500, `failed to render view ${e.toString()}`)
        }

    }

    private async _findPath(paths: string[]): Promise<{ path: string }> {
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
            throw new HttpError(500, `failed to find view path searched paths ${JSON.stringify(lookPaths)}`)
        }

        if (!this._options.viewEngine) {
            throw new HttpError(500, `tried to call render but view engine is no defined`)
        }

        let item = {path: foundPath};

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
            let result: fs.Stats = await Util.promises.fromCallback<fs.Stats>(c => fs.stat(path, c));
            return result.isFile();
        } catch (e) {
            return false;
        }
    }
}

