"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const helpers_1 = require("./helpers");
const utils_1 = require("./utils");
class OutputPatcher {
    constructor(outputPath) {
        this.outputPath = outputPath;
        this.entries = [];
        this.contents = utils_1.createMap();
        this.lastTree = undefined;
        this.isUnchanged = (entryA, entryB) => {
            if (entryA.isDirectory() && entryB.isDirectory()) {
                return true;
            }
            if (entryA.mode === entryB.mode && entryA.checksum === entryB.checksum) {
                return true;
            }
            return false;
        };
    }
    // relativePath should be without leading '/' and use forward slashes
    add(relativePath, content) {
        this.entries.push(new Entry(this.outputPath, relativePath, helpers_1.md5Hex(content)));
        this.contents[relativePath] = content;
    }
    patch() {
        try {
            this.lastTree = this._patch();
        }
        catch (e) {
            // walkSync(output);
            this.lastTree = undefined;
            throw e;
        }
        finally {
            this.entries = [];
            this.contents = utils_1.createMap();
        }
    }
    _patch() {
        let entries = this.entries;
        let lastTree = this.lastTree;
        let isUnchanged = this.isUnchanged;
        let outputPath = this.outputPath;
        let contents = this.contents;
        let nextTree = helpers_1.FSTree.fromEntries(entries, {
            sortAndExpand: true
        });
        if (!lastTree) {
            lastTree = helpers_1.FSTree.fromEntries(helpers_1.walkSync.entries(outputPath));
        }
        let patch = lastTree.calculatePatch(nextTree, isUnchanged);
        patch.forEach((change) => {
            let op = change[0];
            let path = change[1];
            let entry = change[2];
            switch (op) {
                case "mkdir":
                    // the expanded dirs don't have a base
                    fs.mkdirSync(outputPath + "/" + path);
                    break;
                case "rmdir":
                    // the expanded dirs don't have a base
                    fs.rmdirSync(outputPath + "/" + path);
                    break;
                case "unlink":
                    fs.unlinkSync(entry.fullPath);
                    break;
                case "create":
                case "change":
                    fs.writeFileSync(entry.fullPath, contents[path]);
                    break;
                default: throw new Error(`unrecognized case ${op}`);
            }
        });
        return nextTree;
    }
}
exports.default = OutputPatcher;
class Entry {
    constructor(basePath, relativePath, checksum) {
        this.basePath = basePath;
        this.relativePath = relativePath;
        this.checksum = checksum;
        this.mode = 0;
        this.size = 0;
        this.mtime = new Date();
        this.fullPath = basePath + "/" + relativePath;
        this.checksum = checksum;
    }
    isDirectory() {
        return false;
    }
}
//# sourceMappingURL=output-patcher.js.map