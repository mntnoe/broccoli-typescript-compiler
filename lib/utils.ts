import { join } from "path";
import { formatDiagnostics, FormatDiagnosticsHost, ParseConfigHost, readConfigFile, sys } from "typescript";
import { findup } from "./helpers";

const createObject = Object.create;
const newLine = sys.newLine;
const useCaseSensitiveFileNames = sys.useCaseSensitiveFileNames;
const getCurrentDirectory = sys.getCurrentDirectory;

export function getCanonicalFileName(fileName: string): string {
  return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
}

export function getNewLine(): string {
  return newLine;
}

export const formatDiagnosticsHost: FormatDiagnosticsHost = {
  getCurrentDirectory,
  getCanonicalFileName,
  getNewLine
};

export function findConfig(root: string): string {
  return join(findup.sync(root, "package.json"), "tsconfig.json");
}

export function readConfig(configFile: string): any {
  let result = readConfigFile(configFile, sys.readFile);
  if (result.error) {
    let message = formatDiagnostics([result.error], formatDiagnosticsHost);
    throw new Error(message);
  }
  return result.config;
}

export interface Map<T> {
  [key: string]: T | undefined;
}

export function createMap<T>(): Map<T> {
    const map: Map<T> = createObject(null);
    // tslint:disable-next-line
    map["__"] = undefined;
    // tslint:disable-next-line
    delete map["__"];
    return map;
}
