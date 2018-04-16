import * as ts from "typescript";
import { AbsolutePath, CompilerOptionsConfig, TypeScriptConfig } from "../interfaces";
import Input from "./input-io";
export default class ConfigParser {
    private projectPath;
    private rawConfig;
    private configFileName;
    private compilerOptions;
    private host;
    constructor(projectPath: AbsolutePath, rawConfig: TypeScriptConfig | undefined, configFileName: string | undefined, compilerOptions: CompilerOptionsConfig | undefined, workingPath: AbsolutePath, input: Input);
    parseConfig(): ts.ParsedCommandLine;
    private resolveConfigFileName();
    private getBasePath(configFilePath);
    private convertExistingOptions(basePath);
    private readConfigSourceFile(configFilePath);
    private parseConfigContent(configFileName, basePath, existingOptions);
}
