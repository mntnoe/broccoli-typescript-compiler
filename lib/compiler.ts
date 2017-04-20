import * as path from "path";
import * as ts from "typescript";
import { sys } from "typescript";
import { NormalizedAbsolutePath, NormalizedPath } from "./file-utils";
import { heimdall } from "./helpers";
import { JSONConfig } from "./options";
import OutputPatcher from "./output-patcher";
import SourceCache from "./source-cache";
import { formatDiagnosticsHost } from "./utils";

export default class Compiler {
  public config: ts.ParsedCommandLine;

  private output: OutputPatcher;
  private host: ts.LanguageServiceHost;
  private languageService: ts.LanguageService;
  private program: ts.Program;

  constructor(public outputPath: NormalizedAbsolutePath,
              public root: NormalizedAbsolutePath,
              public compilerOptions: ts.CompilerOptions | undefined,
              public configFileName: NormalizedPath | undefined,
              public rawConfig: JSONConfig | undefined) {
    this.output = new OutputPatcher(outputPath);
  }

  public compile(inputPath: NormalizedAbsolutePath) {
    this.updateInput(inputPath);
    this.createProgram();
    this.emitDiagnostics();
    this.emitProgram();
    this.patchOutput();
  }

  protected updateInput(_: NormalizedAbsolutePath) {
    // let input = new Input(this.root, inputPath);
    // let parseConfigHost = input.getParseConfigHost();
    // let rawConfig = this.rawConfig;
    // let configFileName = this.configFileName;
    // if (!rawConfig) {
    //   configFileName = ts.findConfigFile(this.root, (fileName) => {
    //     return parseConfigHost.fileExists(fileName);
    //   }, configFileName);
    // }
    // if (!rawConfig && configFileName) {
    //   let result = ts.readConfigFile(configFileName, (fileName) => {
    //     return parseConfigHost.readFile(fileName);
    //   });
    //   // TODO something with errors
    //   rawConfig = result.config;
    // }
    // if (!rawConfig) {
    //   rawConfig = {};
    // }
  }

  protected createProgram() {
    let languageService = this.languageService;
    let token = heimdall.start("TypeScript:createProgram");
    this.program = languageService.getProgram();
    heimdall.stop(token);
  }

  protected emitDiagnostics() {
    // this is where bindings are resolved and typechecking is done
    let token = heimdall.start("TypeScript:emitDiagnostics");
    let diagnostics = ts.getPreEmitDiagnostics(this.program);
    logDiagnostics(diagnostics);
    heimdall.stop(token);
  }

  protected emitProgram() {
    let token = heimdall.start("TypeScript:emitProgram");
    let emitResult = this.program.emit(undefined, (fileName: string, data: string) => {
      this.output.add(fileName.slice(1), data);
    });
    logDiagnostics(emitResult.diagnostics);
    heimdall.stop(token);
  }

  protected patchOutput() {
    let token = heimdall.start("TypeScript:patchOutput");
    this.output.patch();
    heimdall.stop(token);
  }
}

function logDiagnostics(diagnostics: ts.Diagnostic[] | undefined) {
  if (!diagnostics) {
    return;
  }
  sys.write(ts.formatDiagnostics(diagnostics, formatDiagnosticsHost));
}

// function parseConfig(inputPath: string,
//                      rawConfig: any,
//                      configFileName: string | undefined,
//                      previous?: ts.CompilerOptions) {
//   let host = createParseConfigHost(inputPath);
//   return ts.parseJsonConfigFileContent(rawConfig, host, "/", previous, configFileName);
// }

// function createLanguageServiceHost(compiler: Compiler): ts.LanguageServiceHost {
//   return {
//     getCurrentDirectory() {
//       return "/";
//     },
//     getCompilationSettings() {
//       return compiler.config.options;
//     },
//     getNewLine() {
//       return _getNewLine(compiler.config.options);
//     },
//     getScriptFileNames(): string[] {
//       return compiler.config.fileNames;
//     },
//     getScriptVersion(fileName: string): string {
//       return "" + compiler.input.getScriptVersion(fileName);
//     },
//     getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined {
//       return compiler.input.getScriptSnapshot(fileName);
//     },
//     getDefaultLibFileName() {
//       return compiler.input.libFileName;
//     },
//     fileExists(fileName) {
//       return compiler.input.fileExists(fileName);
//     },
//     readFile(fileName) {
//       return compiler.input.readFile(fileName);
//     }
//   };
// }

// function _getNewLine(options: ts.CompilerOptions): string {
//   let newLine;
//   if (options.newLine === undefined) {
//     newLine = sys.newLine;
//   } else {
//     newLine = options.newLine === ts.NewLineKind.LineFeed ? "\n" : "\r\n";
//   }
//   return newLine;
// }
