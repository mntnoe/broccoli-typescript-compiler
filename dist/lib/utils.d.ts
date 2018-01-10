import { FormatDiagnosticsHost, ParseConfigHost } from "typescript";
export declare function getCanonicalFileName(fileName: string): string;
export declare function getNewLine(): string;
export declare const formatDiagnosticsHost: FormatDiagnosticsHost;
export declare function findConfig(root: string): string;
export declare function readConfig(configFile: string): any;
export declare function createParseConfigHost(inputPath: string): ParseConfigHost;
export interface Map<T> {
    [key: string]: T | undefined;
}
export declare function createMap<T>(): Map<T>;
