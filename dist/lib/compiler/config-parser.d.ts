import * as ts from "typescript";
import { CompilerOptionsConfig, Path, TypeScriptConfig } from "../interfaces";
import Input from "./input-io";
export default class ConfigParser {
    private projectPath;
    private rawConfig;
    private configFileName;
    private compilerOptions;
    private host;
    constructor(projectPath: Path, rawConfig: TypeScriptConfig | undefined, configFileName: string | undefined, compilerOptions: CompilerOptionsConfig | undefined, workingPath: Path, input: Input);
    parseConfig(): ts.ParsedCommandLine;
    private resolveConfigFileName();
    private getBasePath(configFilePath);
    private convertExistingOptions(basePath);
    private readConfigSourceFile(configFilePath);
    private parseConfigContent(configFileName, basePath, existingOptions);
}
