import * as path from "path";
import {
  CompilerOptions,
  Diagnostic,
  findConfigFile,
  ParseConfigHost,
  ParsedCommandLine,
  parseJsonConfigFileContent,
  readConfigFile,
  sys
} from "typescript";
import { isWithin, normalizeAbsolutePath, NormalizedAbsolutePath } from "./file-utils";
import { JSONConfig } from "./options";

export default class ConfigParser {
  private inputPath: NormalizedAbsolutePath | undefined;
  private parseConfigHost: ParseConfigHost | undefined = undefined;

  constructor(public root: NormalizedAbsolutePath,
              public compilerOptions: CompilerOptions | undefined,
              public configFileName: string | undefined,
              public rawConfig: JSONConfig | undefined) {
  }

  public parseConfig(inputPath: NormalizedAbsolutePath): ParsedCommandLine {
    let host = this.parseConfigHost;
    if (this.inputPath !== inputPath) {
      this.inputPath = inputPath;
      host = undefined;
    }
    let resolvedHost;
    if (!host) {
      host = this.parseConfigHost = createParseConfigHost(this.root, inputPath);
    }
    let rawConfig = this.rawConfig;
    let configFileName = this.configFileName;
    let readResult: {
      config?: any,
      error?: Diagnostic
    } | undefined;
    if (!rawConfig) {
      configFileName = findConfigFile(this.root, host.fileExists, configFileName);
      if (configFileName) {
        readResult = readConfigFile(configFileName, host.readFile);
        rawConfig = readResult.config;
      }
    }
    if (!rawConfig) {
      rawConfig = {};
    }
    let basePath = configFileName ? path.dirname(configFileName) : this.root;
    let result = parseJsonConfigFileContent(rawConfig, host, basePath, this.compilerOptions, configFileName);
    if (readResult && readResult.error) {
      result.errors.push(readResult.error);
    }
    return result;
  }

  private getParseConfigHost() {
    // foo
  }
}

type WithinRoot = NormalizedAbsolutePath & { withinRootBrand: true };
type WithinInput = NormalizedAbsolutePath & { withinInputBrand: true };

function createParseConfigHost(root: NormalizedAbsolutePath, inputPath: NormalizedAbsolutePath): ParseConfigHost {
  function withinRoot(fileName: NormalizedAbsolutePath): fileName is WithinRoot {
    return isWithin(root, fileName);
  }

  function withinInput(fileName: string): fileName is WithinInput {
    let absolute = normalizeAbsolutePath(fileName, inputPath);
    return isWithin(inputPath, absolute);
  }

  function toRoot(fileName: WithinInput): string {
    return path.join(root, fileName.substring(inputPath.length + 1));
  }

  function toInput(fileName: WithinRoot): string {
    return path.join(inputPath, fileName.substring(root.length + 1));
  }

  function resolve(fileName: string) {
    return normalizeAbsolutePath(fileName, root);
  }

  function fileExists(fileName: string): boolean {
    let resolved = resolve(fileName);
    let exists = false;
    if (withinRoot(resolved)) {
      exists = sys.fileExists(toInput(resolved));
    }
    return exists || sys.fileExists(resolved);
  }

  function readFile(fileName: string): string {
    let resolved = resolve(fileName);
    let content: string | undefined;
    if (withinRoot(resolved)) {
      content = sys.readFile(toInput(resolved));
    }
    return content || sys.readFile(resolved);
  }

  function readDirectory(dir: string, extensions: string[], exclude: string[], include: string[]): string[] {
    let resolvedDir = resolve(dir);
    let inputFiles: string[] = [];
    if (withinRoot(resolvedDir)) {
      inputFiles = sys.readDirectory(toInput(resolvedDir), extensions, exclude, include);
    }
    let files: string[] = [];
    for (let inputFile of inputFiles) {
      if (withinInput(inputFile)) {
        files.push(toRoot(inputFile));
      }
    }
    return files;
  }

  return {
    useCaseSensitiveFileNames: sys.useCaseSensitiveFileNames,
    readFile,
    readDirectory,
    fileExists
  };
}
