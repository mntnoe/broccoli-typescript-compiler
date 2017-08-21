import { CompilerOptions, IScriptSnapshot } from "typescript";
export default class SourceCache {
    inputPath: string;
    options: CompilerOptions;
    libFileName: string;
    private lastTree;
    private cache;
    private charset;
    private libFilePath;
    constructor(inputPath: string, options: CompilerOptions);
    updateCache(): void;
    realPath(fileName: any): string;
    fileExists(fileName: any): boolean;
    getScriptVersion(fileName: string): number | undefined;
    getScriptSnapshot(fileName: string): IScriptSnapshot | undefined;
    readFile(fileName: string): string;
}
