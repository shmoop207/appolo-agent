"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const request = require("supertest");
const chaiHttp = require("chai-http");
const bodypaser = require("body-parser");
const index_1 = require("../index");
const corsMiddleware_1 = require("./mock/corsMiddleware");
const httpError_1 = require("../lib/httpError");
chai.use(chaiHttp);
let should = chai.should();
describe("e2e", () => {
    let app;
    beforeEach(() => {
        app = index_1.createAgent();
    });
    afterEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield app.close();
    }));
    describe('params', function () {
        it('should call route with params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app
                .get("/test/params/:id/:name/", (req, res) => {
                res.json({ query: req.query, params: req.params });
            })
                .listen(3000);
            let res = yield request(app.handle)
                .get(`/test/params/aaa/bbb?test=${encodeURIComponent("http://www.cnn.com")}`);
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.query.test.should.be.eq("http://www.cnn.com");
            res.body.params.name.should.be.eq("bbb");
            res.body.params.id.should.be.eq("aaa");
        }));
        it('should call  with params url encoded ', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let app = yield index_1.createAgent({ decodeUrlParams: true })
                .get("/test/params/:id/:name/", (req, res) => {
                res.json({ query: req.query, params: req.params });
            })
                .listen(3000);
            let res = yield request(app.handle)
                .get(`/test/params/aaa/${encodeURIComponent("http://www.cnn.com")}`);
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.params.name.should.be.eq("http://www.cnn.com");
            res.body.params.id.should.be.eq("aaa");
            yield app.close();
        }));
    });
    describe('json', function () {
        it('should call route with json', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app
                .get("/test/json", (req, res) => {
                res.json({ query: req.query });
            })
                .listen(3000);
            let res = yield request(app.handle)
                .get('/test/json/?aaa=bbb&ccc=ddd');
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.query.should.be.ok;
            res.body.query.aaa.should.be.eq("bbb");
            res.body.query.ccc.should.be.eq("ddd");
        }));
        it('should call route with post json', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app.use(bodypaser.json())
                .post("/test/json", (req, res) => {
                res.json({ body: req.body });
            })
                .listen(3000);
            let res = yield request(app.handle)
                .post('/test/json/')
                .send({ aaa: "bbb", ccc: "ddd" });
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.body.should.be.ok;
            res.body.body.aaa.should.be.eq("bbb");
            res.body.body.ccc.should.be.eq("ddd");
        }));
    });
    describe('buffer', function () {
        it('should call route with gzip json', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app
                .get("/test/json", (req, res) => {
                res.gzip().json({ query: req.query });
            })
                .listen(3000);
            let res = yield request(app.handle)
                .get('/test/json/?aaa=bbb&ccc=ddd');
            res.should.to.have.status(200);
            res.should.to.be.json;
            res.header["content-encoding"].should.be.eq("gzip");
            res.header["content-length"].should.be.eq("53");
            should.exist(res.body);
            res.body.query.should.be.ok;
            res.body.query.aaa.should.be.eq("bbb");
            res.body.query.ccc.should.be.eq("ddd");
        }));
        it('should call route with post json', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app.use(bodypaser.json())
                .post("/test/json", (req, res) => {
                res.json({ body: req.body });
            })
                .listen(3000);
            let res = yield request(app.handle)
                .post('/test/json/')
                .send({ aaa: "bbb", ccc: "ddd" });
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.body.should.be.ok;
            res.body.body.aaa.should.be.eq("bbb");
            res.body.body.ccc.should.be.eq("ddd");
        }));
    });
    describe('should call route with methods options head', function () {
        it('should  call  Options', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app.use(corsMiddleware_1.cors)
                .listen(3000);
            let res = yield request(app.handle)
                .options('/test/params/aaa/bbb/?user_name=11');
            res.should.to.have.status(204);
            res.header["access-control-allow-origin"].should.be.eq('*');
            res.header["content-length"].should.be.eq('0');
            res.text.should.be.eq("");
        }));
        it('should  call  Middleware error', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app.use(function (req, res, next) {
                next(new Error("test error"));
            })
                .listen(3000);
            let res = yield request(app.handle)
                .get('/test/params/aaa/bbb/?user_name=11');
            res.should.to.have.status(500);
            res.text.should.be.eq("Error: test error");
        }));
        it('should  call  Middleware http Error', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app.use(function (req, res, next) {
                next(new httpError_1.HttpError(404, "test", { test: 1 }));
            })
                .listen(3000);
            let res = yield request(app.handle)
                .get('/test/params/aaa/bbb/?user_name=11');
            res.should.to.have.status(404);
            res.body.test.should.be.eq(1);
        }));
        it('should call controller Head', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app
                .use(corsMiddleware_1.cors)
                .head("/test/params/:name/:name2", (req, res) => {
                res.json({
                    working: true,
                    user_name: req.query.user_name,
                });
            })
                .listen(3000);
            let res = yield request(app.handle)
                .head('/test/params/aaa/bbb/?user_name=11');
            res.should.to.have.status(200);
            res.header["access-control-allow-origin"].should.be.eq('*');
            res.header["content-length"].should.be.eq('33');
            res.header["content-type"].should.be.eq('application/json; charset=utf-8');
            should.not.exist(res.text);
        }));
        it('should call controller empty response', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield app
                .use(corsMiddleware_1.cors)
                .get("/test/params/empty/:name/:name2", (req, res) => {
                res.status(204).send();
            })
                .listen(3000);
            let res = yield request(app.handle)
                .get('/test/params/empty/aaa/bbb/?user_name=11');
            res.should.to.have.status(204);
            res.header["access-control-allow-origin"].should.be.eq('*');
            res.header["content-length"].should.be.eq('0');
            should.not.exist(res.header["content-type"]);
            res.text.should.be.eq("");
        }));
        it("Should  and get route", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            app = index_1.createAgent();
            yield app.get("/test/1", (req, res) => {
                res.send("working");
            }).listen(3000);
            let result = yield request(app.handle).get("/test/1");
            result.text.should.eq("working");
        }));
        it("Should  and head route", () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            app = index_1.createAgent();
            yield app.get("/test/1", (req, res) => {
                res.send("working");
            }).listen(3000);
            let result = yield request(app.handle).head("/test/1");
            result.status.should.be.eq(200);
            should.not.exist(result.text);
            result.header["content-length"].should.be.eq('7');
        }));
    });
});
//# sourceMappingURL=e2e.js.map