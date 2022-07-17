import {
  colors,
  getAbsolutePath,
  prettierData,
  removeFilesSync,
} from '@liangskyli/utils';
import fs from 'fs-extra';
import path from 'path';
import type prettier from 'prettier';
import type { DecoratorMetadata } from './decorator-util';
import { DecoratorType, omitDecorators } from './decorator-util';
import type { GenOpenApiOption } from './gen-openapi-doc';
import { genOpenapiDoc } from './gen-openapi-doc';

export type IGenOpenapiDataOpts = {
  genOpenapiDir: string;
  controllers: string[];
  prettierOptions?: prettier.Options;
  customOmitDecorators?: Pick<DecoratorMetadata, 'name' | 'package'>[];
} & GenOpenApiOption;

const genOpenapiData = async (opts: IGenOpenapiDataOpts) => {
  const {
    genOpenapiDir = './',
    controllers,
    customOmitDecorators = [],
    ...genOpenApiOption
  } = opts;
  let { prettierOptions } = opts;
  if (!genOpenApiOption.genOpenapiType) {
    genOpenApiOption.genOpenapiType = 'json';
  }

  const genOpenapiPath = path.join(genOpenapiDir, 'openapi');
  const genOpenapiAbsolutePath = getAbsolutePath(genOpenapiPath);
  if (!fs.existsSync(getAbsolutePath(genOpenapiDir))) {
    console.error(colors.red(`genOpenapiDir not exits: ${genOpenapiDir}`));
    process.exit(1);
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
  if (prettierOptions === undefined) {
    prettierOptions = { parser: 'json' };
  }
  prettierOptions = Object.assign(prettierOptions, {
    parser: genOpenApiOption.genOpenapiType,
  });
  const openApiV3Path = path.join(
    genOpenapiAbsolutePath,
    `openapi-v3.${genOpenApiOption.genOpenapiType}`,
  );
  fs.writeFileSync(
    openApiV3Path,
    await prettierData(specOpenapiString, prettierOptions),
  );
  console.info(colors.green(`gen openapi success: ${genOpenapiPath}`));
};

export default genOpenapiData;
