import { colors, getAbsolutePath, getConfig, lodash } from '@liangskyli/utils';
import { program } from 'commander';
import fs from 'fs-extra';
import type { IGenOpenapiDataOpts, IGenOpenapiDataOptsCLI } from '../gen';
import genOpenapiData from '../gen';

const commandCodeGenCli = (version: string) => {
  program
    .version(version)
    .option('-c, --configFile [configFile]', 'config file')
    .parse(process.argv);
  let { configFile } = program.opts();

  if (!configFile) {
    configFile = './openapi.config.ts';
  }
  const configFilePath = getAbsolutePath(configFile);
  if (fs.existsSync(configFilePath)) {
    console.info(colors.green(`use configFile path: ${configFile}`));
  } else {
    console.error(colors.red(`-c, --configFile path not exits: ${configFile}`));
    process.exit(1);
  }

  let opts: IGenOpenapiDataOptsCLI = getConfig(configFilePath);

  const runningScript = async () => {
    try {
      if (!lodash.isArray(opts)) {
        opts = [opts] as IGenOpenapiDataOpts[];
      }
      for (let i = 0; i < opts.length; i++) {
        const singleOpts = opts[i];
        if (!singleOpts.genOpenapiDir) {
          console.error(
            colors.red(`config file need genOpenapiDir field: ${configFile}`),
          );
        }
        if (!singleOpts.controllers) {
          console.error(
            colors.red(`config file need controllers field: ${configFile}`),
          );
        }
        await genOpenapiData(singleOpts);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  runningScript();
};

export { commandCodeGenCli };
