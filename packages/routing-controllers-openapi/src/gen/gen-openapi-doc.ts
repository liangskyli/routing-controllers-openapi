import type { SchemaObject, ServerObject } from 'openapi3-ts';
import * as process from 'process';
import type ts from 'typescript';
import { SwaggerSpecBuilder } from '../build/swagger-spec-builder';
import { getFilesFromControllers } from '../utils';
import { MetadataGenerator } from './metadata-generator';

// 因rollup构建后，文件目录位置变更
const packageJson = require(process.env.LIANGSKY_ENV === 'development'
  ? '../../package.json'
  : '../package.json');

interface ResponseSchema {
  type: 'object';
  properties: Record<string, '#ResponseSchema' | SchemaObject>;
  required?: string[];
}

export type GenOpenApiOption = {
  title?: string;
  routePrefix?: string;
  compilerOptions?: ts.CompilerOptions;
  servers?: ServerObject[];
  responseSchema?: ResponseSchema;
  genOpenapiType?: 'json' | 'yaml';
  typeUniqueNames?: boolean;
};

const genOpenapiDoc = (
  controllerPaths: string[],
  options: GenOpenApiOption,
): string => {
  const {
    compilerOptions,
    routePrefix,
    responseSchema,
    genOpenapiType,
    typeUniqueNames,
    title,
  } = options;
  // 获得所有需要编译的router文件
  const routePaths = getFilesFromControllers(controllerPaths);

  const metadata = new MetadataGenerator(
    routePaths,
    compilerOptions,
    typeUniqueNames,
  );
  metadata.generate();
  const specBuilder = new SwaggerSpecBuilder(metadata, {
    info: {
      title: title ? title : packageJson.name,
      version: packageJson.version,
    },
    routePrefix,
    responseSchema,
  });
  const specString =
    genOpenapiType === 'yaml'
      ? specBuilder.getSpecAsYaml()
      : specBuilder.getSpecAsJson(undefined, 2);

  return specString;
};

export { genOpenapiDoc };
