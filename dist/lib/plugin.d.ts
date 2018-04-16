import { BroccoliPlugin } from "./helpers";
import { TypeScriptPluginOptions } from "./interfaces";
export { TypeScriptPluginOptions, TypeScriptConfig, CompilerOptionsConfig } from "./interfaces";
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
export declare function typescript(inputNode: any, options?: TypeScriptPluginOptions): TypeScriptPlugin;
/**
 * TypeScript Broccoli plugin class.
 */
export declare class TypeScriptPlugin extends BroccoliPlugin {
    private compiler;
    private diagnosticHandler;
    private diagnosticWriter;
    private options;
    private normalizedOptions;
    constructor(inputNode: any, options?: TypeScriptPluginOptions);
    build(): void;
    setDiagnosticWriter(write: (message: string) => void): void;
}
