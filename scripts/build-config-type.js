"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const optionDeclarations = require("typescript").optionDeclarations;
const tsPackage = require("typescript/package");
const tsPackagePath = path.dirname(require.resolve("typescript/package"));
const tsTypings = path.resolve(tsPackagePath, tsPackage.typings);
const program = ts.createProgram([tsTypings], {});
ts.getPreEmitDiagnostics(program);
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(tsTypings);
const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
const compilerOptions = checker.getExportsOfModule(moduleSymbol).filter((sym) => sym.name === "CompilerOptions")[0];
const compilerOptionsType = checker.getDeclaredTypeOfSymbol(compilerOptions);
const propNames = compilerOptionsType.getApparentProperties().map((p) => p.name);
const filtered = optionDeclarations.filter((opt) => propNames.indexOf(opt.name) !== -1);
filtered.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
function mapDeclaration(opt) {
    let type;
    if (opt.type === "list") {
        type = mapType(opt.element.type, true);
    }
    else {
        type = mapType(opt.type, false);
    }
    return `${opt.name}?: ${type}`;
}
function mapType(type, isList) {
    let str;
    if (typeof type === "string") {
        if (type === "object") {
            str = "any";
        }
        else {
            str = type;
        }
        if (isList) {
            str = `${str}[]`;
        }
    }
    else {
        str = Array.from(type.keys()).map((key) => JSON.stringify(key)).join(" | ");
        if (isList) {
            str = `Array<${str}>`;
        }
    }
    return str;
}
let file = path.resolve(__dirname, "../lib/json-compiler-options.ts");
let content = `/* tslint:disable */
export interface JSONCompilerOptions {
  ${filtered.map(mapDeclaration).join(";\n  ")};
  [option: string]: any;
}
`;
fs.writeFileSync(file, content);
