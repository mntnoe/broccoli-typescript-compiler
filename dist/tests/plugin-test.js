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
require("mocha");
const filter = require("../index");
const typescript = filter.typescript;
// tslint:disable-next-line:only-arrow-functions
describe("transpile TypeScript", function () {
    this.timeout(10000);
    let input;
    let output;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        input = yield broccoli_test_helper_1.createTempDir();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        yield input.dispose();
        if (output) {
            yield output.dispose();
        }
    }));
    it("compiles basic typescript", () => __awaiter(this, void 0, void 0, function* () {
        input.write({
            "a.ts": `export default class A {}`,
            "index.ts": `export { default as A } from "./a";`
        });
        output = broccoli_test_helper_1.createBuilder(typescript(input.path(), {
            tsconfig: {
                compilerOptions: {
                    module: "commonjs",
                    moduleResolution: "node",
                    newLine: "LF",
                    target: "es2015"
                },
                files: ["index.ts"]
            }
        }));
        yield output.build();
        chai_1.expect(output.changes()).to.be.deep.equal({
            "a.js": "create",
            "index.js": "create"
        });
        chai_1.expect(output.read()).to.deep.equal({
            "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
            "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`
        });
        yield output.build();
        chai_1.expect(output.changes()).to.be.deep.equal({});
        input.write({
            "b.ts": `export default class B {}`,
            "index.ts": `export { default as A } from "./a";
export { default as B } from "./b"`
        });
        yield output.build();
        chai_1.expect(output.changes()).to.be.deep.equal({
            "b.js": "create",
            "index.js": "change"
        });
        chai_1.expect(output.read()).to.deep.equal({
            "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
            "b.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class B {
}
exports.default = B;
`,
            "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
var b_1 = require("./b");
exports.B = b_1.default;
`
        });
        input.write({
            "b.ts": null,
            "index.ts": `export { default as A } from "./a";`
        });
        yield output.build();
        chai_1.expect(output.changes()).to.be.deep.equal({
            "b.js": "unlink",
            "index.js": "change"
        });
        chai_1.expect(output.read()).to.deep.equal({
            "a.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class A {
}
exports.default = A;
`,
            "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`
        });
    }));
    it("handles missing files", () => __awaiter(this, void 0, void 0, function* () {
        input.write({
            "index.ts": `export { default as A } from "./a";`
        });
        output = broccoli_test_helper_1.createBuilder(typescript(input.path(), {
            tsconfig: {
                compilerOptions: {
                    module: "commonjs",
                    moduleResolution: "node",
                    newLine: "LF",
                    target: "es2015"
                },
                files: ["index.ts"]
            }
        }));
        yield output.build();
        chai_1.expect(output.read()).to.deep.equal({
            "index.js": `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var a_1 = require("./a");
exports.A = a_1.default;
`
        });
    }));
});
//# sourceMappingURL=plugin-test.js.map