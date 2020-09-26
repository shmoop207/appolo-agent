"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("@tinyhttp/app");
function one(req, res, next) {
    req.one = true;
    next();
}
function two(req, res, next) {
    req.two = true;
    next();
}
let app = new app_1.App();
app.use(one, two)
    .get('/test/', (req, res) => {
    res.end(`hello world`);
})
    .listen(3000, () => {
    console.log("running tiny http");
});
;
//# sourceMappingURL=tinyhttp.js.map