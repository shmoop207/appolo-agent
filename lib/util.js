"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
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
    static detectIpFromHeaders(req) {
        let ipAddress = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || null;
        return _.isArray(ipAddress) ? ipAddress : ipAddress.split(',');
    }
    static detectIpFromConnectionOrSocket(req) {
        return (req.connection && req.connection.remoteAddress)
            || (req.socket && req.socket.remoteAddress)
            || (req.connection && req.connection.socket && req.connection.socket.remoteAddress) || null;
    }
}
exports.Util = Util;
//# sourceMappingURL=util.js.map