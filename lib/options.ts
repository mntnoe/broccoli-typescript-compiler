import * as path from "path";
import { CompilerOptions } from "typescript";
import {
  normalizeAbsolutePath,
  NormalizedAbsolutePath,
  NormalizedPath,
  normalizePath
} from "./file-utils";
import {
  JSONCompilerOptions
} from "./json-compiler-options";

export interface JSONConfig {
  /**
   * Compiler options.
   */
  compilerOptions?: JSONCompilerOptions;

  /**
   * Glob for root files.
   */
  include?: string[];

  /**
   * Glob to exclude from root files.
   */
  exclude?: string[];

  /**
   * Root files (entry points) to compile.
   */
  files?: string[];
}

export interface PluginOptions {
  /**
   * Used as the base for tsconfig and to resolve relative paths.
   *
   * The input node will act as though it is mounted at this location.
   *
   * Defaults to the dirname of tsconfig (if it is a path) or the
   * current working directory.
   */
  root?: string;

  /**
   * The compiler options.
   *
   * Must be of type `ts.CompilerOptions` not the unparsed options that
   * would be in `tsconfig.json` or on the command line.
   *
   * If there is a tsconfig set or a tsconfig file is found from the root,
   * this wil be passed in as existing options during parse and the actual
   * options used will be the result of the parsed options.
   */
  compilerOptions?: CompilerOptions;

  /**
   * Throw if an error occurs during compilation.
   */
  throwOnError?: boolean;

  /**
   * Path to the tsconfig file or the JSON that would be in a tsconfig.json.
   *
   * The includes and files must be in the input node. External imports will
   * be resolved as though the input node were mounted at the `root` but only
   * types and declarations. All other input should be in the input node.
   */
  tsconfig?: string | JSONConfig;

  annotation?: string;

  passthroughUnusedInput?: boolean;
}

export interface NormalizedOptions {
  root: NormalizedAbsolutePath;

  configFileName: NormalizedPath | undefined;
  rawConfig: JSONConfig | undefined;

  compilerOptions: CompilerOptions | undefined;

  throwOnError: boolean;
  passthroughUnusedInput: boolean;
}

export function normalizeOptions(options: PluginOptions): NormalizedOptions {
  let root = options.root;
  let tsconfig = options.tsconfig;

  let configFileName: NormalizedPath | undefined = undefined;
  let rawConfig: JSONConfig | undefined = undefined;
  if (typeof tsconfig === "object") {
    configFileName = undefined;
    rawConfig = tsconfig;
  } else if (tsconfig) {
    configFileName = normalizePath(tsconfig);
    rawConfig = undefined;
  }

  if (!root) {
    if (configFileName) {
      root = path.dirname(configFileName);
    } else {
      root = ".";
    }
  }

  return {
    configFileName,
    compilerOptions: options.compilerOptions,
    passthroughUnusedInput: options.passthroughUnusedInput === true,
    rawConfig,
    root: normalizeAbsolutePath(root),
    throwOnError: options.throwOnError === true
  };
}
