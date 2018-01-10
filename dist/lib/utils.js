"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const typescript_1 = require("typescript");
const helpers_1 = require("./helpers");
const createObject = Object.create;
const newLine = typescript_1.sys.newLine;
const useCaseSensitiveFileNames = typescript_1.sys.useCaseSensitiveFileNames;
const getCurrentDirectory = typescript_1.sys.getCurrentDirectory;
function getCanonicalFileName(fileName) {
    return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}
exports.getCanonicalFileName = getCanonicalFileName;
function getNewLine() {
    return newLine;
}
exports.getNewLine = getNewLine;
exports.formatDiagnosticsHost = {
    getCurrentDirectory,
    getCanonicalFileName,
    getNewLine
};
function findConfig(root) {
    return path_1.join(helpers_1.findup.sync(root, "package.json"), "tsconfig.json");
}
exports.findConfig = findConfig;
function readConfig(configFile) {
    let result = typescript_1.readConfigFile(configFile, typescript_1.sys.readFile);
    if (result.error) {
        let message = typescript_1.formatDiagnostics([result.error], exports.formatDiagnosticsHost);
        throw new Error(message);
    }
    return result.config;
}
exports.readConfig = readConfig;
function createParseConfigHost(inputPath) {
    let rootLength = inputPath.length;
    let stripRoot = (fileName) => fileName.slice(rootLength);
    let realPath = (fileName) => inputPath + fileName;
    let fileExists = (path) => typescript_1.sys.fileExists(realPath(path));
    let readDirectory = (rootDir, extensions, excludes, includes) => {
        return typescript_1.sys.readDirectory(realPath(rootDir), extensions, excludes, includes).map(stripRoot);
    };
    let readFile = (path) => typescript_1.sys.readFile(realPath(path));
    return {
        useCaseSensitiveFileNames,
        fileExists,
        readDirectory,
        readFile,
    };
}
exports.createParseConfigHost = createParseConfigHost;
function createMap() {
    const map = createObject(null);
    // tslint:disable-next-line
    map["__"] = undefined;
    // tslint:disable-next-line
    delete map["__"];
    return map;
}
exports.createMap = createMap;
//# sourceMappingURL=utils.js.map