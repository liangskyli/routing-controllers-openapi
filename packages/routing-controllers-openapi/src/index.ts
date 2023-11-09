import { commandCodeGenCli } from './cli/code-gen';
import type { IGenOpenapiDataOpts, IGenOpenapiDataOptsCLI } from './gen';
import genOpenapiData from './gen/index';

export { commandCodeGenCli };
export type { IGenOpenapiDataOpts, IGenOpenapiDataOptsCLI };
const defineConfig = (config: IGenOpenapiDataOptsCLI) => {
  return config;
};
export { defineConfig };
export default genOpenapiData;
