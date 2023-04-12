import { colors, getAbsolutePath, getConfig } from '@liangskyli/utils';
import { program } from 'commander';
import fs from 'fs-extra';
import type { IGenOpenapiDataOpts } from '../gen';
import genOpenapiData from '../index';

const commandCodeGenCli = (version: string) => {
  program
    .version(version)
    .option('-c, --configFile [configFile]', 'config file')
    .parse(process.argv);
  const { configFile } = program.opts();
  if (!configFile) {
    console.error(colors.red('-c, --configFile [configFile] field need'));
    process.exit(1);
  }
  const configFilePath = getAbsolutePath(configFile);
  if (!fs.existsSync(configFilePath)) {
    console.error(colors.red(`-c, --configFile path not exits: ${configFile}`));
    process.exit(1);
  }

  const data: IGenOpenapiDataOpts = getConfig(configFilePath);
  if (!data.genOpenapiDir) {
    console.error(
      colors.red(`config file need genOpenapiDir field: ${configFile}`),
    );
  }
  if (!data.controllers) {
    console.error(
      colors.red(`config file need controllers field: ${configFile}`),
    );
  }
  try {
    genOpenapiData(data).then();
  } catch (err: any) {
    console.error(err);
  }
};

export { commandCodeGenCli };
