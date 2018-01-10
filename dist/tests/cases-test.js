"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_test_helper_1 = require("broccoli-test-helper");
const chai_1 = require("chai");
const fs = require("fs");
require("mocha");
const testCasesDir = broccoli_test_helper_1.createReadableDir("tests/cases");
const testCases = fs.readdirSync(testCasesDir.path());
const expectationsDir = broccoli_test_helper_1.createReadableDir("tests/expectations");
const filter = require("../index");
const typescript = filter.typescript;
// tslint:disable-next-line:only-arrow-functions
describe("transpile TypeScript", function () {
    this.timeout(10000);
    let output;
    let input;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        input = yield broccoli_test_helper_1.createTempDir();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        yield input.dispose();
        if (output) {
            yield output.dispose();
        }
    }));
    testCases.forEach((testCase) => {
        it(testCase.replace("-", " "), () => __awaiter(this, void 0, void 0, function* () {
            let tree = testCasesDir.read(testCase);
            delete tree["tsconfig.json"];
            input.write(tree);
            output = broccoli_test_helper_1.createBuilder(typescript(input.path(), {
                tsconfig: testCasesDir.path(testCase + "/tsconfig.json")
            }));
            yield output.build();
            chai_1.expect(output.read()).to.be.deep.equal(expectationsDir.read(testCase));
        }));
    });
});
//# sourceMappingURL=cases-test.js.map