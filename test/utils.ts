import { exec } from "child_process";
import { join, resolve as resolvePath } from "path";
import rimraf from "rimraf";
import { readdirSync, readFileSync, writeFileSync, renameSync } from "fs";
import * as mkdirp from "mkdirp";
import { pipe, head, split, last } from "lodash/fp";
import { ncp } from "ncp";

export const success = 0;
export const failure = 1;
export const customVariableValue = "custom variable value";
export const customFileName = "custom-file";

export interface CLIResult {
  code: number;
  error: Error;
  stdout: any;
  stderr: any;
}

export const cli = (args, cwd) => {
  return new Promise<CLIResult>(resolve => {
    exec(
      `node ${resolvePath("bin/index.js")} ${args.join(" ")}`,
      { cwd },
      (error, stdout, stderr) => {
        const result: CLIResult = {
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr
        };

        resolve(result);
      }
    );
  });
};

export const configFilePath = join(__dirname, "../.hendrixrc.js");
export const defaultTemplatesDirectoryPath = join(__dirname, "../hendrix/");
export const exampleTemplatesPath = join(__dirname, "../examples-mustache/");
export const customTemplatesDirectoryPath = join(
  __dirname,
  "../test-examples/"
);

export const cleanConfigFile = () => {
  rimraf.sync(configFilePath);
};

export const cleanTemplatesDirectory = (
  templatesDirectoryPath = defaultTemplatesDirectoryPath
) => {
  rimraf.sync(templatesDirectoryPath);
};

export const copyTemplatesDirectory = outputPath => {
  return new Promise((resolve, reject) => {
    return ncp(defaultTemplatesDirectoryPath, outputPath, error => {
      if (error) {
        console.error(error);
        reject(error);
      }

      return resolve();
    });
  });
};

export const createConfigFile = (
  configFileContent = `
          module.exports = {
            generatorsPath: "test-examples",
            outputPaths: { 
              reactClass: "test-output", 
              reactClassWithVariables: "test-output" 
            }
          };`
) => {
  writeFileSync(configFilePath, configFileContent);
};

export const cleanTestOutputPath = () => {
  const testOutputPath = join(__dirname, "../test-output");

  rimraf.sync(testOutputPath);
  mkdirp.sync(testOutputPath);
};

export const testCss = fileContent => {
  const line1 = ".Person {}";

  expect(fileContent).toContain(line1);
};

export const testSpec = fileContent => {
  const line1 = "import React from 'react';";
  const line2 = "import Person from './';";
  const line3 = "describe('Person', () => {";
  const line4 = "  it('renders a greeting', () => {";
  const line5 = "    const { getByText } = render(<Person />);";
  const line6 = "    getByText('Hello, world!');";
  const line7 = "  });";
  const line8 = "});";

  expect(fileContent).toContain(line1);
  expect(fileContent).toContain(line2);
  expect(fileContent).toContain(line3);
  expect(fileContent).toContain(line4);
  expect(fileContent).toContain(line5);
  expect(fileContent).toContain(line6);
  expect(fileContent).toContain(line7);
  expect(fileContent).toContain(line8);
};

export const testReadMe = (fileContent, withCustomVariable) => {
  const line1 = "# Person";
  const line3 = "## API";
  const line4 = "```tsx";
  const line5 = "interface PersonProps {}";
  const line6 = "```";
  const line7 = "## Usage";
  const line8 = "<Person />";

  expect(fileContent).toContain(line1);
  expect(fileContent).toContain(line3);
  expect(fileContent).toContain(line4);
  expect(fileContent).toContain(line5);
  expect(fileContent).toContain(line6);
  expect(fileContent).toContain(line7);
  expect(fileContent).toContain(line8);

  if (withCustomVariable) {
    expect(fileContent).toContain(customVariableValue);
  } else {
    expect(fileContent).toContain("Description goes here");
  }
};

export const testReactClass = (
  outputPath,
  options: { withCustomVariable?: boolean; withCustomFileName?: boolean } = {
    withCustomVariable: false,
    withCustomFileName: false
  }
) => {
  const testComponent = fileContent => {
    const line1 = "import React, { Component } from 'react';";
    const line2 = "export default class Person extends Component {";
    const line3 = "  render() {";
    const line4 = "   return <h1>Hello, world!</h1>;";
    const line5 = "  };";
    const line6 = "};";

    expect(fileContent).toContain(line1);
    expect(fileContent).toContain(line2);
    expect(fileContent).toContain(line3);
    expect(fileContent).toContain(line4);
    expect(fileContent).toContain(line5);
  };

  readdirSync(outputPath).forEach(file => {
    const filePath = join(outputPath, file);
    const fileContent = readFileSync(filePath, "utf8");

    if (options.withCustomFileName) {
      expect(head(file.split("."))).toBe(customFileName);
    }

    switch (file) {
      case "index.js":
        return testComponent(fileContent);

      case "index.css":
        return testCss(fileContent);

      case "index.spec.js":
        return testSpec(fileContent);

      case "README.md":
        return testReadMe(fileContent, options.withCustomVariable);
    }
  });
};

export const testReactClassWithVariables = outputPath => {
  const testComponent = fileContent => {
    const line1 = "import React, { Component } from 'react';";
    const line2 = "import Types from 'prop-types';";
    const line3 = "export default class Person extends Component {";
    const line4 = "  render() {";
    const line5 = "   const {";
    const line6 = "     firstName,";
    const line7 = "     age,";
    const line8 = "   } = this.props;";
    const line9 = "   return <h1>Hello, world!</h1>;";
    const line10 = "  };";
    const line11 = "};";
    const line12 = "Person.propTypes = {";
    const line13 = "  firstName: Types.string,";
    const line14 = "  age: Types.number,";
    const line15 = "};";

    expect(fileContent).toContain(line1);
    expect(fileContent).toContain(line2);
    expect(fileContent).toContain(line3);
    expect(fileContent).toContain(line4);
    expect(fileContent).toContain(line5);
    expect(fileContent).toContain(line6);
    expect(fileContent).toContain(line7);
    expect(fileContent).toContain(line8);
    expect(fileContent).toContain(line9);
    expect(fileContent).toContain(line10);
    expect(fileContent).toContain(line11);
    expect(fileContent).toContain(line12);
    expect(fileContent).toContain(line13);
    expect(fileContent).toContain(line14);
    expect(fileContent).toContain(line15);
  };

  readdirSync(outputPath).forEach(file => {
    const filePath = join(outputPath, file);
    const fileContent = readFileSync(filePath, "utf8");

    switch (file) {
      case "index.js":
        return testComponent(fileContent);

      case "index.css":
        return testCss(fileContent);

      case "index.spec.js":
        return testSpec(fileContent);
    }
  });
};

export const getTemplateFileExtension = () => {
  const firstTemplateFile = head(
    readdirSync(join(defaultTemplatesDirectoryPath, "reactClass"))
  );

  return pipe(
    split("."),
    last
  )(firstTemplateFile);
};
