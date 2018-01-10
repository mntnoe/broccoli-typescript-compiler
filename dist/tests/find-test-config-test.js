"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fixturify = require("fixturify");
const mkdirp = require("mkdirp");
const os = require("os");
const path = require("path");
const rimraf = require("rimraf");
const utils_1 = require("../lib/utils");
describe("findTSConfig", () => {
    let tmpdir = path.join(os.tmpdir(), "broccoli-typescript-compiler-test");
    beforeEach((done) => {
        mkdirp(tmpdir, done);
    });
    afterEach((done) => {
        rimraf(tmpdir, done);
    });
    it("basic", () => {
        fixturify.writeSync(tmpdir, {
            "package.json": "",
            "tsconfig.json": ""
        });
        chai_1.expect(utils_1.findConfig(tmpdir)).to.eql(path.join(tmpdir, "tsconfig.json"));
    });
    it("nested, but without own package.json", () => {
        fixturify.writeSync(tmpdir, {
            "nested": {
                "tsconfig.json": "",
            },
            "package.json": "",
            "tsconfig.json": ""
        });
        chai_1.expect(utils_1.findConfig(path.join(tmpdir, "nested"))).to.equal(path.join(tmpdir, "tsconfig.json"));
    });
    it("nested, but with own package.json", () => {
        fixturify.writeSync(tmpdir, {
            "nested": {
                "package.json": "",
                "tsconfig.json": ""
            },
            "package.json": "",
            "tsconfig.json": ""
        });
        chai_1.expect(utils_1.findConfig(path.join(tmpdir, "nested"))).to.equal(path.join(tmpdir, "nested", "tsconfig.json"));
    });
});
//# sourceMappingURL=find-test-config-test.js.map