"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai = require("chai");
const request = require("supertest");
const index_1 = require("../index");
const corsMiddleware_1 = require("./mock/corsMiddleware");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
let should = chai.should();
describe("e2e", () => {
    let app;
    beforeEach(() => {
        app = index_1.rocketjet();
    });
    afterEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield app.close();
    }));
    describe('methods options head', function () {
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
        // it("Should  and get route", async () => {
        //     let app = rocketjet();
        //
        //     await app.get("/test/1", (req:IRequest,res:IResponse)=> {
        //         res.send("working")
        //     }).listen(3000)
        //
        //     let result= await supertest(app.handle).get("/test/1")
        //
        //     result.text.should.eq("working")
        // });
    });
});
//# sourceMappingURL=e2e.js.map