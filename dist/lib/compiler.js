"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const typescript_1 = require("typescript");
const helpers_1 = require("./helpers");
const output_patcher_1 = require("./output-patcher");
const source_cache_1 = require("./source-cache");
const utils_1 = require("./utils");
class Compiler {
    constructor(outputPath, inputPath, rawConfig, configFileName) {
        this.outputPath = outputPath;
        this.inputPath = inputPath;
        this.rawConfig = rawConfig;
        this.configFileName = configFileName;
        let output = new output_patcher_1.default(outputPath);
        let config = parseConfig(inputPath, rawConfig, configFileName, undefined);
        logDiagnostics(config.errors);
        let input = new source_cache_1.default(inputPath, config.options);
        this.output = output;
        this.config = config;
        this.input = input;
        this.host = createLanguageServiceHost(this);
        this.languageService = ts.createLanguageService(this.host, ts.createDocumentRegistry());
    }
    updateInput(inputPath) {
        // the config builds the list of files
        let token = helpers_1.heimdall.start("TypeScript:updateInput");
        let config = this.config = parseConfig(inputPath, this.rawConfig, this.configFileName, this.config.options);
        logDiagnostics(config.errors);
        if (this.inputPath !== inputPath) {
            this.inputPath = inputPath;
            this.config = config;
            this.input = new source_cache_1.default(inputPath, config.options);
        }
        else {
            this.input.updateCache();
        }
        helpers_1.heimdall.stop(token);
    }
    compile() {
        this.createProgram();
        this.emitDiagnostics();
        this.emitProgram();
        this.patchOutput();
    }
    createProgram() {
        let languageService = this.languageService;
        let token = helpers_1.heimdall.start("TypeScript:createProgram");
        this.program = languageService.getProgram();
        helpers_1.heimdall.stop(token);
    }
    emitDiagnostics() {
        // this is where bindings are resolved and typechecking is done
        let token = helpers_1.heimdall.start("TypeScript:emitDiagnostics");
        let diagnostics = ts.getPreEmitDiagnostics(this.program);
        logDiagnostics(diagnostics);
        helpers_1.heimdall.stop(token);
    }
    emitProgram() {
        let token = helpers_1.heimdall.start("TypeScript:emitProgram");
        let emitResult = this.program.emit(undefined, (fileName, data) => {
            this.output.add(fileName.slice(1), data);
        });
        logDiagnostics(emitResult.diagnostics);
        helpers_1.heimdall.stop(token);
    }
    patchOutput() {
        let token = helpers_1.heimdall.start("TypeScript:patchOutput");
        this.output.patch();
        helpers_1.heimdall.stop(token);
    }
}
exports.default = Compiler;
function logDiagnostics(diagnostics) {
    if (!diagnostics) {
        return;
    }
    typescript_1.sys.write(ts.formatDiagnostics(diagnostics, utils_1.formatDiagnosticsHost));
}
function parseConfig(inputPath, rawConfig, configFileName, previous) {
    let host = utils_1.createParseConfigHost(inputPath);
    return ts.parseJsonConfigFileContent(rawConfig, host, "/", previous, configFileName);
}
function createLanguageServiceHost(compiler) {
    return {
        getCurrentDirectory() {
            return "/";
        },
        getCompilationSettings() {
            return compiler.config.options;
        },
        getNewLine() {
            return _getNewLine(compiler.config.options);
        },
        getScriptFileNames() {
            return compiler.config.fileNames;
        },
        getScriptVersion(fileName) {
            return "" + compiler.input.getScriptVersion(fileName);
        },
        getScriptSnapshot(fileName) {
            return compiler.input.getScriptSnapshot(fileName);
        },
        getDefaultLibFileName() {
            return compiler.input.libFileName;
        },
        fileExists(fileName) {
            return compiler.input.fileExists(fileName);
        },
        readFile(fileName) {
            return compiler.input.readFile(fileName);
        }
    };
}
function _getNewLine(options) {
    let newLine;
    if (options.newLine === undefined) {
        newLine = typescript_1.sys.newLine;
    }
    else {
        newLine = options.newLine === ts.NewLineKind.LineFeed ? "\n" : "\r\n";
    }
    return newLine;
}
//# sourceMappingURL=compiler.js.map