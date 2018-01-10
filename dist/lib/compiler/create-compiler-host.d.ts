import { CompilerHost, CompilerOptions } from "typescript";
import { Path } from "../interfaces";
import InputIO from "./input-io";
import SourceCache from "./source-cache";
export default function createCompilerHost(workingPath: Path, input: InputIO, sourceCache: SourceCache, compilerOptions: CompilerOptions): CompilerHost;
