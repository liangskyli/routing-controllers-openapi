import { commandCodeGenCli } from './cli/code-gen';
import genOpenapiData from './gen/index';

export type { IGenOpenapiDataOpts, IGenOpenapiDataOptsCLI } from './gen/index';
export { commandCodeGenCli };
export default genOpenapiData;
