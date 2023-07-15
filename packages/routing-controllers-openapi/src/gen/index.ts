import type { IPrettierOptions } from '@liangskyli/utils';
import { colors, getAbsolutePath, removeFilesSync } from '@liangskyli/utils';
import fs from 'fs-extra';
import path from 'path';
import { writePrettierFile } from '../utils';
import type { DecoratorMetadata } from './decorator-util';
import { DecoratorType, omitDecorators } from './decorator-util';
import type { GenOpenApiOption } from './gen-openapi-doc';
import { genOpenapiDoc } from './gen-openapi-doc';

export type IGenOpenapiDataOpts = {
  genOpenapiDir: string;
  controllers: string[];
  prettierOptions?: IPrettierOptions;
  customOmitDecorators?: Pick<DecoratorMetadata, 'name' | 'package'>[];
} & Partial<GenOpenApiOption>;

export type IGenOpenapiDataOptsCLI =
  | IGenOpenapiDataOpts
  | IGenOpenapiDataOpts[];

const genOpenapiData = async (opts: IGenOpenapiDataOpts) => {
  const {
    genOpenapiDir = './',
    controllers,
    customOmitDecorators = [],
    genOpenapiType = 'json',
    ...genOpenApiOptionWithoutType
  } = opts;
  let { prettierOptions } = opts;
  const genOpenApiOption = { ...genOpenApiOptionWithoutType, genOpenapiType };

  const genOpenapiPath = path.join(genOpenapiDir, 'openapi');
  const genOpenapiAbsolutePath = getAbsolutePath(genOpenapiPath);
  if (!fs.existsSync(getAbsolutePath(genOpenapiDir))) {
    console.error(colors.red(`genOpenapiDir not exits: ${genOpenapiDir}`));
    throw new Error('genOpenapiDir not exits!');
  }

  removeFilesSync(genOpenapiAbsolutePath);
  console.info(colors.green(`Clean openapi dir: ${genOpenapiPath}`));

  fs.ensureDirSync(genOpenapiAbsolutePath);

  // add customOmitDecorators
  customOmitDecorators.forEach((item) => {
    omitDecorators.push({
      name: item.name,
      package: item.package,
      type: DecoratorType.Omit,
    });
  });

  // 生成openapi数据
  const specOpenapiString = genOpenapiDoc(controllers, genOpenApiOption);
  prettierOptions = Object.assign(prettierOptions ?? {}, {
    parser: genOpenApiOption.genOpenapiType,
  });
  const openApiV3Path = path.join(
    genOpenapiAbsolutePath,
    `openapi-v3.${genOpenApiOption.genOpenapiType}`,
  );

  await writePrettierFile({
    absolutePath: openApiV3Path,
    prettierOptions,
    data: specOpenapiString,
    successTip: `gen openapi success: ${genOpenapiPath}`,
  });
};

export default genOpenapiData;
