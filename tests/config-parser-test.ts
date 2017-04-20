import { createBuilder, createTempDir, Output, TempDir } from "broccoli-test-helper";
import { expect } from "chai";
import "mocha";
import * as ts from "typescript";
import ConfigParser from "../lib/config-parser";
import { normalizeAbsolutePath as normalize } from "../lib/file-utils";

/* tslint:disable:object-literal-sort-keys */
/* tslint:disable:object-literal-key-quotes */
describe("ConfigParser", () => {
  let root: TempDir;
  let input: TempDir;
  beforeEach(async () => {
    [ root, input ] = await Promise.all([
      createTempDir(),
      createTempDir()
    ]);
  });

  context("with an extended config", () => {
    beforeEach(() => {
      root.write({
        "tsconfig.json": `{
          "compilerOptions": {
            "moduleResolution": "node",
            "outDir": "dist",
            "types": ["foo"],
            "typeRoots": [
              "typings"
            ]
          }
        }`,
        "lib": {
          "tsconfig.json": `{
            "extends": "../tsconfig.json",
            "compilerOptions": {
              "strictNullChecks": true
            }
          }`,
          "b.ts": "export class B {};"
        },
        "typings": {
          "foo": {
            "index.d.ts": "export default class Foo {};"
          }
        }
      });
      input.write({
        "lib": {
          "a.ts": "export class A {};"
        }
      });
    });

    it("should be able to find the extended config", () => {
      let parser = new ConfigParser(
        normalize(root.path()), {
          module: ts.ModuleKind.UMD
        }, "lib/tsconfig.json", undefined);
      let parsed = parser.parseConfig(normalize(input.path()));
      expect(parsed.errors).to.deep.equal([]);
      expect(parsed.options).to.deep.equal({
        "configFilePath": normalize( root.path("lib/tsconfig.json") ),
        "module": ts.ModuleKind.UMD,
        "moduleResolution": ts.ModuleResolutionKind.NodeJs,
        "outDir": normalize( root.path("dist") ),
        "strictNullChecks": true,
        "typeRoots": [
          normalize( root.path("typings") )
        ],
        "types": [ "foo" ]
      });
      expect(parsed.fileNames).to.deep.equal([
        normalize( root.path("lib/a.ts") )
      ]);
    });
  });

  afterEach(async () => {
    await Promise.all([
      root.dispose(),
      input.dispose()
    ]);
  });
});
