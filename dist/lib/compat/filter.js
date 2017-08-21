"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Funnel = require("broccoli-funnel");
const MergeTrees = require("broccoli-merge-trees");
const plugin_1 = require("../plugin");
/**
 * Backwards compat filter behavior.
 *
 * Preserves the filter aspect of compiling only .ts
 * and passing through all other files.
 */
function filterLike(inputNode, options) {
    let passthrough = new Funnel(inputNode, {
        annotation: "TypeScript passthrough",
        exclude: ["**/*.ts"]
    });
    let filter = new Funnel(inputNode, {
        annotation: "TypeScript input",
        include: ["**/*.ts"]
    });
    return new MergeTrees([
        passthrough,
        new plugin_1.TypeScript(filter, options)
    ], {
        annotation: "TypeScript passthrough + ouput",
        overwrite: true
    });
}
exports.default = filterLike;
//# sourceMappingURL=filter.js.map