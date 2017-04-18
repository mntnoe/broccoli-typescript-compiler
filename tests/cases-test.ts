import { createBuilder, createReadableDir, createTempDir, Output, TempDir } from "broccoli-test-helper";
import { expect } from "chai";
import * as fs from "fs";
import { sync as globSync } from "glob";
import * as path from "path";
import "mocha";

const optionDeclarations: OptionDeclaration[] = require("typescript").optionDeclarations;
const optionMap = new Map<string, OptionDeclaration>();
optionDeclarations.forEach((opt) => {
  optionMap.set(opt.name, opt);
});

interface OptionDeclaration {
  name: string;
  type: "string" | "boolean" | "object" | "list" | "number" | Map<string, number>;
}

import filter = require("../index");
const typescript = filter.typescript;

const TYPESCRIPT_ROOT = path.resolve(__dirname, "vendor/typescript");

interface ProjectTestCase {
  scenario: string;
  // project where it lives - this also is the current directory when compiling
  projectRoot: string;
  // list of input files to be given to program
  inputFiles: string[];
  // should we resolve this map root and give compiler the absolute disk path as map root?
  resolveMapRoot?: boolean;
  // should we resolve this source root and give compiler the absolute disk path as map root?
  resolveSourceRoot?: boolean;
  // Verify the baselines of output files, if this is false, we will write to output to the disk
  // but there is no verification of baselines
  baselineCheck?: boolean;
  // Run the resulting test
  runTest?: boolean;
  // If there is any bug associated with this test case
  bug?: string;
}

class ProjectRunner {
  constructor(private root: string) {
  }

  public enumerateTestFiles() {
    return ;
  }

  public initializeTests() {
    globSync(this.root + "tests/cases/project/*.json").forEach((fileName) => {
      this.runProjectTestCase(fileName);
    });
  }

  private runProjectTestCase(testCaseFileName: string) {
    const testFileText = fs.readFileSync(testCaseFileName, "utf8");
    const testCase: ProjectRunnerTestCase = JSON.parse(testFileText);
    const testCaseRelativeName = testCaseFileName.substring(this.root.length);
    const project = createReadableDir(this.root + testCase.projectRoot);
    const projectCompilerOptions = this.extractCompilerOptions(testCase);

    describe("Compiling project for " + testCase.scenario + ": testcase " + testCaseRelativeName, () => {
      let output: Output;
      let input: TempDir;

      function verifyCompilerResults(module: string) {
        let compilerOptions = Object.assign(projectCompilerOptions, {
          module
        });

        it(`should build for ${module}`, async () => {
          input.write(project.read());

          let options: any = {
            tsconfig: {
              compilerOptions
            }
          };

          if (testCase.inputFiles) {
            options.tsconfig.files = testCase.inputFiles;
          }

          output = createBuilder(typescript(input.path(), options));

          await output.build();

          // expect(true, "ok");
        });
      }

      beforeEach(async () => {
        input = await createTempDir();
      });

      verifyCompilerResults("commonjs");
      verifyCompilerResults("amd");

      afterEach(async () => {
        await input.dispose();
        if (output) {
          await output.dispose();
          output = <any> undefined;
        }
      });
    });
  }

  private extractCompilerOptions(testCase: any): any {
    let basePath = this.root + testCase.projectRoot;

    let options = {};

    optionDeclarations.forEach((opt) => {
      let name = opt.name;
      if (name in testCase) {
        options[name] = testCase[name];
      }
    });

    return options;
  }
}

interface ProjectRunnerTestCase {
  scenario: string;
  projectRoot: string; // project where it lives - this also is the current directory when compiling
  inputFiles: string[]; // list of input files to be given to program
  resolveMapRoot?: boolean; // should we resolve this map root and give compiler the absolute disk path as map root?
  resolveSourceRoot?: boolean; // should we resolve this source root and give compiler the absolute disk path as map root?
  baselineCheck?: boolean; // Verify the baselines of output files, if this is false, we will write to output to the disk but there is no verification of baselines
  runTest?: boolean; // Run the resulting test
  bug?: string; // If there is any bug associated with this test case
}

let runner = new ProjectRunner(TYPESCRIPT_ROOT);

describe("Projects tests", () => {
  runner.initializeTests();
});
