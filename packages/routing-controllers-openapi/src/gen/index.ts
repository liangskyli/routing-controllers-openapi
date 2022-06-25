import { colors, getAbsolutePath, prettierData, removeFilesSync } from '@liangskyli/utils';
import fs from 'fs-extra';
import path from 'path';
import type prettier from 'prettier';
import type { GenOpenApiOption } from './gen-openapi-doc';
import { genOpenapiDoc } from './gen-openapi-doc';

export type IGenOpenapiDataOpts = {
  genOpenapiDir: string;
  controllers: string[];
  prettierOptions?: prettier.Options;
} & GenOpenApiOption;

const genOpenapiData = async (opts: IGenOpenapiDataOpts) => {
  const {
    title,
    genOpenapiDir = './',
    controllers,
    compilerOptions,
    routePrefix,
    servers,
    responseSchema,
    genOpenapiType = 'json',
  } = opts;
  let { prettierOptions } = opts;

  const genOpenapiPath = path.join(genOpenapiDir, 'openapi');
  const genOpenapiAbsolutePath = getAbsolutePath(genOpenapiPath);
  if (!fs.existsSync(getAbsolutePath(genOpenapiDir))) {
    console.error(colors.red(`genOpenapiDir not exits: ${genOpenapiDir}`));
    process.exit(1);
  }

  removeFilesSync(genOpenapiAbsolutePath);
  console.info(colors.green(`Clean openapi dir: ${genOpenapiPath}`));

  fs.ensureDirSync(genOpenapiAbsolutePath);

  // 生成openapi数据
  const specOpenapiString = genOpenapiDoc(controllers, {
    title,
    routePrefix,
    compilerOptions,
    servers,
    responseSchema,
    genOpenapiType,
  });
  if (prettierOptions === undefined) {
    prettierOptions = { parser: 'json' };
  }
  prettierOptions = Object.assign(prettierOptions, { parser: genOpenapiType });
  const openApiV3Path = path.join(genOpenapiAbsolutePath, `openapi-v3.${genOpenapiType}`);
  fs.writeFileSync(openApiV3Path, await prettierData(specOpenapiString, prettierOptions));
  console.info(colors.green(`gen openapi success: ${genOpenapiPath}`));
};

export default genOpenapiData;
