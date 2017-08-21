"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("./compiler");
const helpers_1 = require("./helpers");
const utils_1 = require("./utils");
var utils_2 = require("./utils");
exports.findConfig = utils_2.findConfig;
/**
 * Returns a Broccoli plugin instance that compiles
 * the files in the tsconfig.
 *
 * It is rooted to the inputNode's outputPath, all
 * files it imports must be resolvable from its input
 * except for the default library file.
 *
 * Errors are logged and it will try to emit whatever
 * it could successfully compile.
 *
 * It will only emit based on the root source files
 * you give it, by default it will look for all .ts
 * files, but if you specify a files or filesGlob
 * it will these as entry points and only compile
 * the files and files they reference from the input.
 */
function typescript(inputNode, options) {
    return new TypeScript(inputNode, options);
}
exports.typescript = typescript;
/**
 * TypeScript Broccoli plugin class.
 */
class TypeScript extends helpers_1.BroccoliPlugin {
    constructor(inputNode, options) {
        super([inputNode], {
            annotation: options && options.annotation,
            name: "broccoli-typescript-compiler",
            persistentOutput: true
        });
        let configFileName;
        let config;
        if (!options || !options.tsconfig) {
            configFileName = utils_1.findConfig(helpers_1.getCallerFile(2));
            config = utils_1.readConfig(configFileName);
        }
        else if (typeof options.tsconfig === "string") {
            configFileName = options.tsconfig;
            config = utils_1.readConfig(configFileName);
        }
        else {
            configFileName = undefined;
            config = options.tsconfig;
        }
        this.config = config;
        this.configFileName = configFileName;
    }
    build() {
        let token = helpers_1.heimdall.start("TypeScript:compile");
        let inputPath = this.inputPaths[0];
        let host = this.host;
        if (!host) {
            host = this.host = new compiler_1.default(this.outputPath, inputPath, this.config, this.configFileName);
        }
        host.updateInput(inputPath);
        host.compile();
        helpers_1.heimdall.stop(token);
    }
}
exports.TypeScript = TypeScript;
//# sourceMappingURL=plugin.js.map