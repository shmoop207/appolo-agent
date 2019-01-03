import    http = require('http');
import    _ = require('lodash');

export class Util {

    public static parseUrlFast(str: string): { pathname: string, query: string } {
        let index = str.indexOf('?');
        if (index > -1) {
            let pathname = str.substring(0, index);
            let query = str.substring(index + 1);

            return {query, pathname}
        } else {
            return {pathname: str, query: ""}
        }
    }

    public static detectIpFromHeaders(req: http.IncomingMessage): string[] {
        let ipAddress = req.headers['x-client-ip'] || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || null;

        return _.isArray(ipAddress) ? ipAddress : ipAddress.split(',')

    }

    public static detectIpFromConnectionOrSocket(req: http.IncomingMessage): string {
        return (req.connection && req.connection.remoteAddress)
            || (req.socket && req.socket.remoteAddress)
            || (req.connection && (req.connection as any).socket && (req.connection as any).socket.remoteAddress) || null;

    }


}

