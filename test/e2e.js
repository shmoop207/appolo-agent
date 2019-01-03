"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const request = require("supertest");
const chaiHttp = require("chai-http");
const bodypaser = require("body-parser");
const consolidate = require("consolidate");
const index_1 = require("../index");
const corsMiddleware_1 = require("./mock/corsMiddleware");
const httpError_1 = require("../lib/errors/httpError");
chai.use(chaiHttp);
chai.use(sinonChai);
let should = chai.should();
describe("e2e", () => {
    let app;
    beforeEach(() => {
        app = index_1.createAgent();
    });
    afterEach(async () => {
        await app.close();
    });
    describe('params', function () {
        it('should call route with params', async () => {
            await app
                .get("/test/params/:id/:name/", (req, res) => {
                res.json({ query: req.query, params: req.params });
            })
                .listen(3000);
            let res = await request(app.handle)
                .get(`/test/params/aaa/bbb?test=${encodeURIComponent("http://www.cnn.com")}`);
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.query.test.should.be.eq("http://www.cnn.com");
            res.body.params.name.should.be.eq("bbb");
            res.body.params.id.should.be.eq("aaa");
        });
        it('should call route with ip x-forwarded-for', async () => {
            await app
                .get("/test/params/:id/:name/", (req, res) => {
                res.json({ query: req.query, params: req.params, ip: req.ip });
            })
                .listen(3000);
            let res = await request(app.handle)
                .get(`/test/params/aaa/bbb?test=${encodeURIComponent("http://www.cnn.com")}`).set("x-forwarded-for", "1.3.4.5,4.5.6.7");
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.ip.should.be.eq("1.3.4.5");
        });
        it('should call route with ip x-forwarded-for', async () => {
            await app
                .get("/test/params/:id/:name/", (req, res) => {
                res.json({ query: req.query, params: req.params, ip: req.ip });
            })
                .listen(3000);
            let res = await request(app.handle)
                .get(`/test/params/aaa/bbb?test=${encodeURIComponent("http://www.cnn.com")}`);
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.ip.should.be.eq("::ffff:127.0.0.1");
        });
        it('should call  with params url encoded ', async () => {
            let app = await index_1.createAgent({ decodeUrlParams: true })
                .get("/test/params/:id/:name/", (req, res) => {
                res.json({ query: req.query, params: req.params });
            })
                .listen(3000);
            let res = await request(app.handle)
                .get(`/test/params/aaa/${encodeURIComponent("http://www.cnn.com")}`);
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.params.name.should.be.eq("http://www.cnn.com");
            res.body.params.id.should.be.eq("aaa");
            await app.close();
        });
    });
    describe('json', function () {
        it('should call route with json', async () => {
            await app
                .get("/test/json", (req, res) => {
                res.json({ query: req.query });
            })
                .listen(3000);
            let res = await request(app.handle)
                .get('/test/json/?aaa=bbb&ccc=ddd');
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.query.should.be.ok;
            res.body.query.aaa.should.be.eq("bbb");
            res.body.query.ccc.should.be.eq("ddd");
        });
        it('should call route with post json', async () => {
            await app.use(bodypaser.json())
                .post("/test/json", (req, res) => {
                res.json({ body: req.body });
            })
                .listen(3000);
            let res = await request(app.handle)
                .post('/test/json/')
                .send({ aaa: "bbb", ccc: "ddd" });
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.body.should.be.ok;
            res.body.body.aaa.should.be.eq("bbb");
            res.body.body.ccc.should.be.eq("ddd");
        });
    });
    describe('buffer', function () {
        it('should call route with gzip json', async () => {
            await app
                .get("/test/json", (req, res) => {
                res.gzip().json({ query: req.query });
            })
                .get("/test/json", (req, res) => {
                res.gzip().json({ query: req.query });
            })
                .listen(3000);
            let res = await request(app.handle)
                .get('/test/json/?aaa=bbb&ccc=ddd');
            res.should.to.have.status(200);
            res.should.to.be.json;
            res.header["content-encoding"].should.be.eq("gzip");
            res.header["content-length"].should.be.eq("53");
            should.exist(res.body);
            res.body.query.should.be.ok;
            res.body.query.aaa.should.be.eq("bbb");
            res.body.query.ccc.should.be.eq("ddd");
        });
        it('should call route with gzip object', async () => {
            await app
                .get("/test/json", (req, res) => {
                res.gzip().send({ query: req.query });
            })
                .listen(3000);
            let res = await request(app.handle)
                .get('/test/json/?aaa=bbb&ccc=ddd');
            res.should.to.have.status(200);
            res.should.to.be.json;
            res.header["content-encoding"].should.be.eq("gzip");
            res.header["content-length"].should.be.eq("53");
            should.exist(res.body);
            res.body.query.should.be.ok;
            res.body.query.aaa.should.be.eq("bbb");
            res.body.query.ccc.should.be.eq("ddd");
        });
        it('should call route with gzip empty', async () => {
            await app
                .get("/test/json", (req, res) => {
                res.gzip().send(null);
            })
                .listen(3000);
            let res = await request(app.handle)
                .get('/test/json/?aaa=bbb&ccc=ddd');
            res.should.to.have.status(200);
            res.header["content-length"].should.be.eq("0");
        });
        it('should call route with post json', async () => {
            await app.use(bodypaser.json())
                .post("/test/json", (req, res) => {
                res.json({ body: req.body });
            })
                .listen(3000);
            let res = await request(app.handle)
                .post('/test/json/')
                .send({ aaa: "bbb", ccc: "ddd" });
            res.should.to.have.status(200);
            res.should.to.be.json;
            should.exist(res.body);
            res.body.body.should.be.ok;
            res.body.body.aaa.should.be.eq("bbb");
            res.body.body.ccc.should.be.eq("ddd");
        });
    });
    describe('should render view', () => {
        it("should render view", async () => {
            app = await index_1.createAgent({
                viewEngine: consolidate.nunjucks, viewFolder: "test/mock"
            }).listen(3000);
            app.get("/test/view", (req, res) => {
                res.render("raw", { test: "working" });
            });
            let res = await request(app.handle)
                .get('/test/view/');
            res = await request(app.handle)
                .get('/test/view/');
            res.should.to.have.status(200);
            res.should.to.be.html;
            res.text.should.be.ok;
            res.text.should.be.eq("hello working");
        });
    });
    describe('should call route with methods options head', function () {
        it('should  call  Options', async () => {
            await app.use(corsMiddleware_1.cors)
                .listen(3000);
            let res = await request(app.handle)
                .options('/test/params/aaa/bbb/?user_name=11');
            res.should.to.have.status(204);
            res.header["access-control-allow-origin"].should.be.eq('*');
            res.header["content-length"].should.be.eq('0');
            res.text.should.be.eq("");
        });
        it('should  call  Middleware error', async () => {
            await app.use(function (req, res, next) {
                next(new Error("test error"));
            })
                .listen(3000);
            let res = await request(app.handle)
                .get('/test/params/aaa/bbb/?user_name=11');
            res.should.to.have.status(500);
            res.text.should.be.eq('{"statusCode":500,"message":"Error: test error"}');
        });
        it('should  call  Middleware http Error', async () => {
            await app.use(function (req, res, next) {
                next(new httpError_1.HttpError(404, "test", null, { test: 1 }));
            })
                .listen(3000);
            let res = await request(app.handle)
                .get('/test/params/aaa/bbb/?user_name=11');
            res.should.to.have.status(404);
            res.body.test.should.be.eq(1);
        });
        it('should call controller Head', async () => {
            await app
                .use(corsMiddleware_1.cors)
                .head("/test/params/:name/:name2", (req, res) => {
                res.json({
                    working: true,
                    user_name: req.query.user_name,
                });
            })
                .listen(3000);
            let res = await request(app.handle)
                .head('/test/params/aaa/bbb/?user_name=11');
            res.should.to.have.status(200);
            res.header["access-control-allow-origin"].should.be.eq('*');
            res.header["content-length"].should.be.eq('33');
            res.header["content-type"].should.be.eq('application/json; charset=utf-8');
            should.not.exist(res.text);
        });
        it('should call controller empty response', async () => {
            await app
                .use(corsMiddleware_1.cors)
                .get("/test/params/empty/:name/:name2", (req, res) => {
                res.status(204).send();
            })
                .listen(3000);
            let res = await request(app.handle)
                .get('/test/params/empty/aaa/bbb/?user_name=11');
            res.should.to.have.status(204);
            res.header["access-control-allow-origin"].should.be.eq('*');
            res.header["content-length"].should.be.eq('0');
            should.not.exist(res.header["content-type"]);
            res.text.should.be.eq("");
        });
        it("Should  and get route", async () => {
            app = index_1.createAgent();
            await app.get("/test/1", (req, res) => {
                res.send("working");
            }).listen(3000);
            let result = await request(app.handle).get("/test/1");
            result.text.should.eq("working");
        });
        it("Should  and head route", async () => {
            app = index_1.createAgent();
            await app.get("/test/1", (req, res) => {
                res.send("working");
            }).listen(3000);
            let result = await request(app.handle).head("/test/1");
            result.status.should.be.eq(200);
            should.not.exist(result.text);
            result.header["content-length"].should.be.eq('7');
        });
    });
    describe('events', function () {
        it('should fire events', async () => {
            let spy = sinon.spy();
            for (let key in index_1.Events) {
                app.once(index_1.Events[key], spy);
            }
            await app
                .get("/test/params/:id/:name/", (req, res) => {
                res.json({ query: req.query, params: req.params });
            })
                .listen(3000);
            let res = await request(app.handle)
                .get(`/test/params/aaa/bbb?test=${encodeURIComponent("http://www.cnn.com")}`);
            res.should.to.have.status(200);
            res.should.to.be.json;
            await app.close();
            spy.should.callCount(Object.keys(index_1.Events).length);
        });
    });
    describe('errors', function () {
        it('should throw valid errors', async () => {
            app = index_1.createAgent();
            await app.get("/test/error", (req, res) => {
                throw new httpError_1.HttpError(400, "test error", new httpError_1.HttpError(500, "inner error", null, null, 999));
            }).listen(3000);
            let result = await request(app.handle).get("/test/error");
            result.status.should.be.eq(400);
            result.body.code.should.be.eq(999);
            result.body.message.should.be.eq("test error");
            result.body.error.should.be.eq("inner error");
        });
    });
});
//# sourceMappingURL=e2e.js.map