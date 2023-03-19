const commander = require('commander');
const fs = require('fs-extra');
const utils = require('@liangskyli/utils');
const genOpenapiData = require('../lib/index.cjs');

const packageJson = require('../package.json');
commander.program
  .version(packageJson.version)
  .option('-c, --configFile [configFile]', 'config file')
  .parse(process.argv);
const { configFile } = commander.program.opts();
if (!configFile) {
  console.error(utils.colors.red('-c, --configFile [configFile] field need'));
  process.exit(1);
}
const configFilePath = utils.getAbsolutePath(configFile);
if (!fs.existsSync(configFilePath)) {
  console.error(
    utils.colors.red(`-c, --configFile path not exits: ${configFile}`),
  );
  process.exit(1);
}
const data = utils.getConfig(configFilePath);
if (!data.genOpenapiDir) {
  console.error(
    utils.colors.red(`config file need genOpenapiDir field: ${configFile}`),
  );
}
if (!data.controllers) {
  console.error(
    utils.colors.red(`config file need controllers field: ${configFile}`),
  );
}
const runningScript = () => {
  try {
    genOpenapiData(data).then();
  } catch (err) {
    console.error(err);
  }
};
runningScript();
