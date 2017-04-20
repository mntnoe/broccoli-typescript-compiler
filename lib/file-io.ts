import { realpathSync } from "fs";
import * as path from "path";
import { ParseConfigHost, sys } from "typescript";
import {
  getCanonicalFileName,
  isWithin,
  normalizeAbsolutePath,
  NormalizedAbsolutePath,
  useCaseSensitiveFileNames
} from "./file-utils";

export default class IO {
  private readIO: ReadIO | undefined;
  private parseConfigHost: ParseConfigHost | undefined;

  constructor(public root: NormalizedAbsolutePath, public inputPath: NormalizedAbsolutePath) {
  }

  public update(inputPath: NormalizedAbsolutePath) {
    if (this.inputPath !== inputPath) {
      this.inputPath = inputPath;
      this.readIO = createReadIO(this.root, this.inputPath);
      this.parseConfigHost = undefined;
    }
  }

  public getReadIO(): ReadIO {
    let readIO = this.readIO;
    if (readIO === undefined) {
      readIO = this.readIO = createReadIO(this.root, this.inputPath);
    }
    return readIO;
  }

  public getParseConfigHost(): ParseConfigHost {
    let host = this.parseConfigHost;
    if (host === undefined) {
      host = this.parseConfigHost = createParseConfigHost(this.getReadIO());
    }
    return host;
  }
}

function createParseConfigHost(readIO: ReadIO): ParseConfigHost {
  return {
    fileExists: readIO.fileExists,
    readDirectory: readIO.readDirectory,
    readFile: readIO.readFile,
    useCaseSensitiveFileNames
  };
}

type WithinRoot = NormalizedAbsolutePath & { withinRootBrand: true };
type WithinInput = NormalizedAbsolutePath & { withinInputBrand: true };

function createReadIO(root: NormalizedAbsolutePath, inputPath: NormalizedAbsolutePath): ReadIO {
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

  function getCurrentDirectory(): string {
    return root;
  }

  function getDirectories(directoryName: string): string[] {
    let resolved = resolve(directoryName);
    let dirs = sys.readDirectory(resolved);
    if (withinRoot(resolved)) {
      for (let dir of sys.readDirectory(toInput(resolved))) {
        if (dirs.indexOf(dir) !== -1) {
          dirs.push(dir);
        }
      }
    }
    return dirs;
  }

  function fileExists(fileName: string): boolean {
    let resolved = resolve(fileName);
    let exists = false;
    if (withinRoot(resolved)) {
      exists = sys.fileExists(toInput(resolved));
    }
    return exists || sys.fileExists(resolved);
  }

  function directoryExists(dirName: string): boolean {
    let resolved = resolve(dirName);
    let exists = false;
    if (withinRoot(resolved)) {
      exists = sys.directoryExists(toInput(resolved));
    }
    return exists || sys.directoryExists(resolved);
  }

  // TODO filter out input extensions from root.
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

  function realpath(fileName: string): string {
    let resolved = resolve(fileName);
    if (withinRoot(resolved)) {
      let input = toInput(resolved);
      if (directoryExists(input) || fileExists(input)) {
        return fileName;
      }
    }
    return normalizeAbsolutePath(realpathSync(fileName));
  }

  return {
    directoryExists,
    fileExists,
    getCurrentDirectory,
    getCanonicalFileName,
    useCaseSensitiveFileNames: () => useCaseSensitiveFileNames,
    getDirectories,
    readDirectory,
    readFile,
    realpath
  };
}

export interface ReadIO {
  /**
   * Returns root.
   */
  getCurrentDirectory: () => string;

  /**
   * Gets immediate child directories within a directory.
   *
   * Merges directories from inputPath if corresponding directory
   * exists in inputPath.
   */
  getDirectories: (directoryName: string) => string[];

  /**
   * If `useCaseSensitiveFileNames` is false, this will toLowerCase() the fileName.
   */
  getCanonicalFileName: (fileName: string) => string;

  useCaseSensitiveFileNames: () => boolean;

  /**
   * Used to parse config rootNames.  Does not fallback to root. Input must be found
   * in the broccoli input node.
   */
  readDirectory: (rootDir: string, extensions: string[], excludes: string[], includes: string[]) => string[];

  /**
   * File exists and is a file.
   *
   * If path is within root, will try coresponding inputPath first.
   */
  fileExists: (fileName: string) => boolean;

  /**
   * File exists and is a directory.
   *
   * If path is within root, will try coresponding inputPath first.
   */
  directoryExists: (directoryName: string) => boolean;

  /**
   * Read the file if exists, does return undefined on error
   * but not typed that way because the Host interfaces don't have that.
   *
   * If path is within root, will try coresponding inputPath first.
   */
  readFile: (fileName: string, encoding?: boolean) => string;

  /**
   * Used for node module resultion only.
   *
   * If coresponding inputPath is found, it will be returned as is.
   * Realpath is only reported for files in root. This allows you to
   * funnel node_modules in the inputNode. Will still fallback to
   * root and realpath if not in inputNode (only reason to put
   * a module in the input is so that you can watch it).
   */
  realpath: (fileName: string) => string;
}
