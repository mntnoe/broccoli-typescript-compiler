import * as ts from "typescript";
import SourceCache from "./compiler/source-cache";
import { DiagnosticsHandler, NormalizedOptions, Path } from "./interfaces";
export default class Compiler {
    inputPath: Path;
    outputPath: Path;
    options: NormalizedOptions;
    private diagnosticsHandler;
    private resolver;
    private workingPath;
    private rootPath;
    private buildPath;
    private input;
    private configParser;
    private sourceCache;
    private output;
    private program;
    constructor(inputPath: Path, outputPath: Path, options: NormalizedOptions, diagnosticsHandler: DiagnosticsHandler);
    compile(): void;
    protected parseConfig(): ts.ParsedCommandLine;
    protected getSourceCache(options: ts.CompilerOptions): SourceCache;
    protected createProgram(config: ts.ParsedCommandLine, sourceCache: SourceCache): ts.Program;
    protected emitDiagnostics(program: ts.Program): void;
    protected resolveBuildPath(options: ts.CompilerOptions): Path;
    protected emitProgram(program: ts.Program, buildPath: Path): void;
    protected patchOutput(): void;
    protected resetCaches(): void;
}
