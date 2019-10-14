#!/usr/bin/env node

import commander from "commander";
import { promisify } from "util";
import { readdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import mkdirp from "mkdirp";
import { ncp } from "ncp";
import { join } from "path";
import { pipe, map, join as joinStrings, head, split, filter } from "lodash/fp";
import { get } from "lodash";
import chalk from "chalk";
import { render } from "mustache";

const addMargin = str => `${str}\n`;

const safeRequire = (filePath, defaultValue = void 0) => {
  try {
    return require(filePath);
  } catch (_error) {
    return defaultValue;
  }
};

const currentWorkingDirectory = process.cwd();

const configPath = join(currentWorkingDirectory, ".hendrixrc.js");

const DEFAULT_CONFIG = { templatesPath: "hendrix", outputPaths: {} };

const { templatesPath, outputPaths } = safeRequire(configPath, DEFAULT_CONFIG);

const prettifyAvailableGenerators = pipe(
  map(generator => {
    return `  ${generator}`;
  }),
  joinStrings("\n")
);

const getAvailableGenerators = () => {
  const availableGenerators = readdirSync(
    join(currentWorkingDirectory, templatesPath),
    {
      withFileTypes: true
    }
  )
    .filter(dirEnt => dirEnt.isDirectory())
    .map(({ name }) => name);

  const hasAvailableGenerators = availableGenerators.length > 0;

  if (hasAvailableGenerators) {
    return prettifyAvailableGenerators(availableGenerators);
  }

  return "  No available generators";
};

const additionalHelpMessage = (availableGenerators: string) => `
Note:
  You can also use the alias 'h' instead of 'hendrix', for example:

  h <template> <name> <output-path> [...variables]

Available generators:
${availableGenerators}

${chalk.underline(
  "For more documentation and examples, visit: https://github.com/seanWLawrence/hendrix#readme"
)}
`;

const displayAvailableGenerators = pipe(
  additionalHelpMessage,
  console.log
);

const formatVariables = pipe(
  head,
  map(variableString => {
    const [variableName, variableValue] = variableString.split(":");

    return { [variableName]: variableValue };
  })
);

const stripTemplateExtension = pipe(
  split("."),
  filter(word => word !== "mustache"),
  joinStrings(".")
);

const createTemplatesDirectoryIfDoesNotExist = () => {
  const templatesDirectoryExists = existsSync(templatesPath);

  if (!templatesDirectoryExists) {
    console.log(
      addMargin(
        chalk.yellow(
          "Templates directory does not exist, creating one for you..."
        )
      )
    );

    const examplesPath = join(__dirname, "../src/examples");

    return new Promise((resolve, reject) =>
      ncp(examplesPath, templatesPath, error => {
        if (error) {
          console.log(chalk.red(error.message));
          reject(error);
        }

        console.log(
          addMargin(
            chalk.green(
              `Successfully created new templates directory at "${templatesPath}" with some examples!`
            )
          )
        );

        resolve();
      })
    );
  }
};

const generateFiles = ({ template, outputPath, name, variables }) => {
  const templateFilesPath = join(templatesPath, template);

  createTemplatesDirectoryIfDoesNotExist().then(() => {
    const templateFiles = readdirSync(templateFilesPath);

    templateFiles.forEach(templateFile => {
      const templateFilePath = join(templateFilesPath, templateFile);
      const templateContent = readFileSync(templateFilePath, "utf8");

      const renderedTemplate = render(templateContent, { variables, name });

      const baseFileOutputPath = get(outputPaths, templateFile, "");

      const directoryOutputPath = join(
        currentWorkingDirectory,
        baseFileOutputPath,
        outputPath
      );

      mkdirp.sync(directoryOutputPath);

      const fileOutputPath = join(
        directoryOutputPath,
        stripTemplateExtension(templateFile)
      );

      writeFileSync(fileOutputPath, renderedTemplate);

      console.log(
        chalk.green(`
       ----------------------------------------------------------------
          Successfully generated "${template}" files - happy coding!
       ----------------------------------------------------------------
        `)
      );
    });
  });
};

const noCommandsEntered = process.argv.slice(2).length === 0;

const cli = new commander.Command();

/**
 * CLI
 */
const main = () => {
  createTemplatesDirectoryIfDoesNotExist().then(() => {
    const availableGenerators = getAvailableGenerators();

    cli
      .version("1.0.6")
      .usage("<template> <name> <output-path> [variables...]")
      .description(
        "Generate files from your templates directory. Default: './hendrix'"
      )
      .arguments("<template> <name> <output-path> [variables...]")
      .action(
        (
          template: string,
          name: string,
          outputPath: string,
          ...variables: string[]
        ) => {
          generateFiles({
            template,
            outputPath,
            name,
            variables: formatVariables(variables)
          });
        }
      );

    cli.on("--help", () => {
      displayAvailableGenerators(availableGenerators);
    });

    if (noCommandsEntered) {
      cli.outputHelp();
    }

    cli.parse(process.argv);
  });
};

main();

export default main;
