"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const http = require("http");
const https = require("https");
class Server {
    static createServer(app) {
        let ssl = app.options.ssl;
        if (!ssl || !ssl.key || !ssl.cert) {
            return http.createServer(app.handle);
        }
        let options = {
            key: fs.readFileSync(ssl.key),
            cert: fs.readFileSync(ssl.cert)
        };
        return https.createServer(options, app.handle);
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map