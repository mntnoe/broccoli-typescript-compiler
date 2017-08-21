import { BroccoliPlugin } from "./helpers";
export interface TypeScriptOptions {
    tsconfig?: Object | string | undefined;
    annotation?: string | undefined;
}
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
export declare function typescript(inputNode: any, options?: TypeScriptOptions | undefined): TypeScript;
/**
 * TypeScript Broccoli plugin class.
 */
export declare class TypeScript extends BroccoliPlugin {
    private config;
    private configFileName;
    private host;
    constructor(inputNode: any, options?: TypeScriptOptions | undefined);
    build(): void;
}
