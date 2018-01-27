"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    static decodeParam(val) {
        if (typeof val !== 'string' || val.length === 0) {
            return val;
        }
        try {
            return decodeURIComponent(val);
        }
        catch (err) {
            if (err instanceof URIError) {
                err.message = `Failed to decode param ${val}`;
                throw err;
            }
        }
    }
    static parseUrlFast(str) {
        let index = str.indexOf('?');
        if (index > -1) {
            let pathname = str.substring(0, index);
            let query = str.substring(index + 1);
            return { query, pathname };
        }
        else {
            return { pathname: str, query: "" };
        }
    }
    static parseQsFast(url) {
        let vars = {}, hash;
        let hashes = (url || "").split('&');
        for (let i = 0, length = hashes.length; i < length; i++) {
            let hash = hashes[i], equalsIndex = hash.indexOf('='), key = hash.substring(0, equalsIndex), value = hash.substring(equalsIndex + 1);
            let bracketEnd = key.length - 1;
            if (key.charCodeAt(bracketEnd) == 93) {
                let bracketStart = key.indexOf("[");
                let nestedKey = key.substring(0, bracketStart), nestedKeyValue = key.substring(bracketStart + 1, bracketEnd);
                let arr = vars[nestedKey] || (vars[nestedKey] = []);
                arr[nestedKeyValue === "" ? arr.length : nestedKeyValue] = Util.decodeParamSafe(value);
            }
            else {
                vars[key] = Util.decodeParamSafe(value);
            }
        }
        return vars;
    }
    static decodeParamSafe(str) {
        try {
            return decodeURIComponent(str);
        }
        catch (e) {
            return str;
        }
    }
}
Util.addSlashEnd = (str) => {
    if (str[str.length - 1] != "/") {
        return str += "/";
    }
    return str;
};
Util.addSlashEndFast = (str) => {
    if (str.charCodeAt(str.length - 1) != 47) {
        return str += "/";
    }
    return str;
};
exports.Util = Util;
//# sourceMappingURL=util.js.map