import * as ts from "typescript";
import SourceCache from "./source-cache";
export default class Compiler {
    outputPath: string;
    inputPath: string;
    rawConfig: any;
    configFileName: string | undefined;
    config: ts.ParsedCommandLine;
    input: SourceCache;
    private output;
    private host;
    private languageService;
    private program;
    constructor(outputPath: string, inputPath: string, rawConfig: any, configFileName: string | undefined);
    updateInput(inputPath: string): void;
    compile(): void;
    protected createProgram(): void;
    protected emitDiagnostics(): void;
    protected emitProgram(): void;
    protected patchOutput(): void;
}
