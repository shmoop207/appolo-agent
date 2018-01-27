"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./lib/app");
var app_2 = require("./lib/app");
exports.App = app_2.App;
function rocketjet(options) {
    return new app_1.App(options);
}
exports.rocketjet = rocketjet;
function default_1(options) {
    return rocketjet(options);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map