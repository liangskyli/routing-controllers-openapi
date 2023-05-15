import fs from 'fs-extra';
import type { oas31 as oa } from 'openapi3-ts';
import path from 'path';
import type ts from 'typescript';
import { SwaggerSpecBuilder } from '../build/swagger-spec-builder';
import { getFilesFromControllers } from '../utils';
import { MetadataGenerator } from './metadata-generator';

const getPackageJsonInfo = () => {
  // 因rollup构建后，文件目录位置变更
  let packageJsonPath = path.join(__dirname, '../../package.json');
  if (!fs.pathExistsSync(packageJsonPath)) {
    // build path
    packageJsonPath = path.join(__dirname, '../package.json');
  }
  const packageJson = fs.readJSONSync(packageJsonPath);
  const { name, version } = packageJson;
  return {
    name,
    version,
  };
};

interface ResponseSchema {
  type: 'object';
  properties: Record<string, '#ResponseSchema' | oa.SchemaObject>;
  required?: string[];
}

export type GenOpenApiOption = {
  title?: string;
  routePrefix?: string;
  compilerOptions?: ts.CompilerOptions;
  servers?: oa.ServerObject[];
  responseSchema?: ResponseSchema;
  genOpenapiType: 'json' | 'yaml';
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
  const packageJson = getPackageJsonInfo();
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
