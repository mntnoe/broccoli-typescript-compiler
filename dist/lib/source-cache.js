"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
const helpers_1 = require("./helpers");
const utils_1 = require("./utils");
class SourceCache {
    constructor(inputPath, options) {
        this.inputPath = inputPath;
        this.options = options;
        this.lastTree = undefined;
        this.cache = utils_1.createMap();
        this.charset = options.charset;
        this.libFileName = "/__" + typescript_1.getDefaultLibFileName(options);
        this.libFilePath = typescript_1.getDefaultLibFilePath(options);
    }
    updateCache() {
        let nextTree = helpers_1.FSTree.fromEntries(helpers_1.walkSync.entries(this.inputPath));
        let cache = this.cache;
        let lastTree = this.lastTree;
        if (lastTree) {
            lastTree.calculatePatch(nextTree).forEach((change) => {
                let op = change[0];
                let path = change[1];
                switch (op) {
                    case "unlink":
                        cache["/" + path] = undefined;
                        break;
                    case "change":
                        let file = cache["/" + path];
                        if (file) {
                            file.content = undefined;
                            file.version++;
                        }
                        break;
                    default:
                }
            });
        }
        this.lastTree = nextTree;
    }
    realPath(fileName) {
        if (this.libFileName === fileName) {
            return this.libFilePath;
        }
        return this.inputPath + fileName;
    }
    fileExists(fileName) {
        return typescript_1.sys.fileExists(this.realPath(fileName));
    }
    getScriptVersion(fileName) {
        let file = this.cache[fileName];
        return file && file.version;
    }
    getScriptSnapshot(fileName) {
        let text = this.readFile(fileName);
        return text !== undefined ? typescript_1.ScriptSnapshot.fromString(text) : undefined;
    }
    readFile(fileName) {
        let cache = this.cache;
        let file = cache[fileName];
        if (file === undefined) {
            file = cache[fileName] = {
                content: undefined,
                version: 0
            };
        }
        let content;
        if (file.content) {
            content = file.content;
        }
        else {
            content = file.content = typescript_1.sys.readFile(this.realPath(fileName), this.charset);
        }
        return content;
    }
}
exports.default = SourceCache;
//# sourceMappingURL=source-cache.js.map