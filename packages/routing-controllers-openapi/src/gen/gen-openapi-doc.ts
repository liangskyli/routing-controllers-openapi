import type { SchemaObject, ServerObject } from 'openapi3-ts';
import type * as TJS from 'typescript-json-schema';
import { SwaggerSpecBuilder } from '../build/swagger-spec-builder';
import { getFilesFromControllers } from '../utils';
import { MetadataGenerator } from './metadata-generator';

const packageJson = require('../../package.json');

interface ResponseSchema {
  type: 'object';
  properties: Record<string, '#ResponseSchema' | SchemaObject>;
  required?: string[];
}

export type GenOpenApiOption = {
  title?: string;
  routePrefix?: string;
  compilerOptions?: TJS.CompilerOptions;
  servers?: ServerObject[];
  responseSchema?: ResponseSchema;
  genOpenapiType?: 'json' | 'yaml';
};

const genOpenapiDoc = (controllerPaths: string[], options: GenOpenApiOption): string => {
  const { compilerOptions, routePrefix, responseSchema, genOpenapiType, title } = options;
  // 获得所有需要编译的router文件
  const routePaths = getFilesFromControllers(controllerPaths);

  const metadata = new MetadataGenerator(routePaths, compilerOptions);
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
