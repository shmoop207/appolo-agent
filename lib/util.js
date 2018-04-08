"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
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
}
exports.Util = Util;
//# sourceMappingURL=util.js.map