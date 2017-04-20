import * as path from "path";
import { CompilerOptions } from "typescript";
import Compiler from "./compiler";
import { normalizeAbsolutePath } from "./file-utils";
import { BroccoliPlugin, getCallerFile, heimdall } from "./helpers";
import { NormalizedOptions, normalizeOptions, PluginOptions } from "./options";
export { findConfig } from "./utils";

/**
 * Returns a Broccoli plugin instance that compiles
 * the files in the tsconfig.
 *
 * It is rooted to the inputNode's outputPath, all
 * files it imports must be resolvable from its input
 * except for the default library file.
 *
 * Errors are logged and it will try to emit whatever
 * it could successfully compile.
 *
 * It will only emit based on the root source files
 * you give it, by default it will look for all .ts
 * files, but if you specify a files or filesGlob
 * it will these as entry points and only compile
 * the files and files they reference from the input.
 */
export function typescript(inputNode: any, options?: PluginOptions) {
  return new TypeScript(inputNode, options);
}

/**
 * TypeScript Broccoli plugin class.
 */
export class TypeScript extends BroccoliPlugin {
  private host: Compiler | undefined;
  private options: NormalizedOptions;

  constructor(inputNode: any, options?: PluginOptions) {
    super([ inputNode ], {
      annotation: options && options.annotation,
      name: "broccoli-typescript-compiler",
      persistentOutput: true
    });
    this.options = normalizeOptions(options || {});
  }

  public build() {
    let token = heimdall.start("TypeScript:compile");
    let inputPath = this.inputPaths[0];
    let options = this.options;
    let host = this.host;
    if (!host) {
      host = this.host = new Compiler(
        normalizeAbsolutePath(this.outputPath),
        options.root,
        options.compilerOptions,
        options.configFileName,
        options.rawConfig
      );
    }
    host.compile(normalizeAbsolutePath(inputPath));
    heimdall.stop(token);
  }
}
