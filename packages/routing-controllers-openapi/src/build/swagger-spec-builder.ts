import { colors, lodash } from '@liangskyli/utils';
import type * as oa from 'openapi3-ts';
import type { InfoObject } from 'openapi3-ts';
import type { Controller } from '../gen/controller-generator';
import type { GenOpenApiOption } from '../gen/gen-openapi-doc';
import type { MetadataGenerator } from '../gen/metadata-generator';
import type { TypeSchema } from '../gen/type-generator';
import { REGEX_UNIQUE_MD5 } from '../gen/type-generator';
import { OpenapiBuilder } from './openapi-builder';

export type Config = {
  info: InfoObject;
} & Pick<GenOpenApiOption, 'routePrefix' | 'servers' | 'responseSchema'>;

export class SwaggerSpecBuilder extends OpenapiBuilder {
  private readonly metadata: MetadataGenerator;
  private readonly config: Config;
  private noResponseSchemaFlagTip: boolean = true;
  constructor(metadata: MetadataGenerator, config: Config) {
    super();
    this.metadata = metadata;
    this.config = config;
  }

  public getSpec(): oa.OpenAPIObject {
    const { info, servers, responseSchema } = this.config;
    this.addTitle(info.title).addVersion(info.version);
    if (info.description) this.addDescription(info.description);
    if (servers && servers.length) {
      servers.forEach((s) => this.addServer(s));
    }

    this.metadata.controllers.forEach((controller) => {
      const controllerName = controller.name.replace(/controller$/i, '');
      this.addTag({
        name: controllerName,
        description: controller.description,
      });

      controller.methods.forEach((method) => {
        const paramObjs: oa.ParameterObject[] = [];
        let requestBody: oa.RequestBodyObject | undefined;

        for (const parameter of method.parameters) {
          if (parameter.options?.paramIn === 'body') {
            const mediaType =
              parameter.options.mediaType ||
              method.options?.mediaType ||
              controller.options?.mediaType ||
              '*/*';
            requestBody = requestBody || {
              content: { [mediaType]: {} },
            };
            const mediaTypeObj = requestBody.content[mediaType];
            if (parameter.options.wholeParam) {
              if (mediaTypeObj.schema) {
                throw new Error('encountered multiple body parameters');
              }
              mediaTypeObj.schema = parameter.schema;
              if (parameter.required) requestBody.required = true;
            } else {
              let bodySchema = mediaTypeObj.schema as
                | oa.SchemaObject
                | undefined;
              if (!bodySchema) {
                bodySchema = mediaTypeObj.schema = {
                  type: 'object',
                  properties: {},
                };
              }

              if (bodySchema.properties?.[parameter.name]) {
                throw new Error(
                  'encountered multiple body parameter ' + parameter.name,
                );
              }

              bodySchema.properties![parameter.name] = parameter.schema ?? {};
              if (parameter.required) {
                requestBody.required = true;
                if (bodySchema.required === undefined) {
                  bodySchema.required = [];
                }
                bodySchema.required.push(parameter.name);
              }
            }
          } else if (parameter.options?.wholeParam) {
            const schema = parameter.schema?.$ref
              ? this.metadata.typeSchemas.getSchemaByRef(parameter.schema.$ref)
              : parameter.schema;
            if (schema.properties) {
              for (const name in schema.properties) {
                if (
                  schema.properties.hasOwnProperty(name) &&
                  parameter.options.paramIn
                ) {
                  paramObjs.push(
                    this.getParamObject(
                      name,
                      parameter.options.paramIn,
                      schema.properties[name] as TypeSchema,
                      schema.required && schema.required.indexOf(name) !== -1,
                    ),
                  );
                }
              }
            }
          } else if (parameter.options?.paramIn) {
            paramObjs.push(
              this.getParamObject(
                parameter.name,
                parameter.options.paramIn,
                parameter.schema,
                parameter.required,
              ),
            );
          }
        }

        method.routes.forEach((route) => {
          const path = this.buildFullRoute(route.route, controller);
          let pathObj: oa.PathItemObject = this.rootDoc.paths[path];
          if (!pathObj) {
            this.addPath(path, (pathObj = {}));
          }

          const operation: oa.OperationObject = {
            tags: [controllerName],
            responses: { 200: { description: 'Success' } },
          };
          if (method.summary) operation.summary = method.summary;
          if (paramObjs.length) operation.parameters = paramObjs;
          if (requestBody && route.method !== 'get')
            operation.requestBody = requestBody;
          let newResponseSchema: GenOpenApiOption['responseSchema'];
          if (method.returnSchema) {
            if (responseSchema) {
              let haveResponseSchema = false;
              newResponseSchema = lodash.cloneDeep(responseSchema);
              const { properties = {} } = newResponseSchema!;
              Object.keys(properties).forEach((key: string) => {
                const propItem = properties[key];
                if (propItem === '#ResponseSchema') {
                  properties[key] = method.returnSchema;
                  haveResponseSchema = true;
                }
              });
              if (!haveResponseSchema) {
                if (this.noResponseSchemaFlagTip) {
                  console.warn(
                    colors.yellow(
                      'you have not set #ResponseSchema in responseSchema config.',
                    ),
                  );
                  this.noResponseSchemaFlagTip = false;
                }
              }
            }
            operation.responses['200'].content = {
              [method.options?.mediaType ||
              controller.options?.mediaType ||
              '*/*']: {
                schema: newResponseSchema ?? method.returnSchema,
              },
            };
          }

          pathObj[route.method] = operation;
        });
      });
    });

    // add all referenced schemas
    const schemas = this.metadata.typeSchemas;
    for (const [name, schema] of Object.entries(schemas.getSchemasData())) {
      let isAdd = true;

      if (!this.metadata.typeUniqueNames) {
        // filter unused schema
        if (name.match(REGEX_UNIQUE_MD5)) {
          isAdd = false;
        }
      }
      if (isAdd) {
        this.addSchema(name, schema);
      }
    }

    return super.getSpec();
  }

  private buildFullRoute(route: string, controller: Controller): string {
    let path: string = this.config.routePrefix ?? '';
    if (controller.route) {
      path += controller.route;
    }
    if (route) {
      path += route;
    }

    return path.replace(/(\/)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, '$1{$2}');
  }

  private getParamObject(
    name: string,
    where: oa.ParameterLocation,
    schema: TypeSchema,
    required?: boolean,
  ): oa.ParameterObject {
    const paramObj: oa.ParameterObject = { name, in: where };
    if (required || where === 'path') {
      paramObj.required = true;
    }

    paramObj.schema = {};
    for (const key in schema) {
      if (schema.hasOwnProperty(key)) {
        if (key !== 'description') {
          paramObj.schema[key] = schema[key];
        } else {
          paramObj[key] = schema[key];
        }
      }
    }

    return paramObj;
  }
}
