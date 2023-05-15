import { colors, lodash } from '@liangskyli/utils';
import type { oas31 as oa } from 'openapi3-ts';
import type { Controller } from '../gen/controller-generator';
import type { GenOpenApiOption } from '../gen/gen-openapi-doc';
import type { MetadataGenerator } from '../gen/metadata-generator';
import type { TypeSchema } from '../gen/type-generator';
import { REGEX_UNIQUE_MD5 } from '../gen/type-generator';
import { OpenapiBuilder } from './openapi-builder';

export type Config = {
  info: oa.InfoObject;
} & Pick<GenOpenApiOption, 'routePrefix' | 'servers' | 'responseSchema'>;

export class SwaggerSpecBuilder extends OpenapiBuilder {
  private readonly metadata: MetadataGenerator;
  private readonly config: Config;
  private noResponseSchemaFlagTip: boolean = true;
  constructor(metadata: MetadataGenerator, config: Config) {
    super();
    this.metadata = metadata;
    this.config = config;
    this.generateSpec();
  }

  private generateSpec(): oa.OpenAPIObject {
    const { info, servers, responseSchema } = this.config;
    this.addTitle(info.title).addVersion(info.version);
    // if (info.description) this.addDescription(info.description);
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
        let requestBody: oa.RequestBodyObject | undefined = undefined;

        for (const parameter of method.parameters) {
          if (parameter.options?.paramIn === 'body') {
            const mediaType =
              parameter.options.mediaType ||
              method.options?.mediaType ||
              controller.options?.mediaType ||
              '*/*';
            requestBody = requestBody ?? {
              content: { [mediaType]: {} },
            };
            if (!requestBody.content[mediaType]) {
              requestBody = {
                content: {
                  ...requestBody.content,
                  [mediaType]: {},
                },
              };
            }
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

          const operation: oa.OperationObject = {
            tags: [controllerName],
            responses: { 200: { description: 'Success' } },
          };
          if (method.summary) operation.summary = method.summary;
          if (paramObjs.length) operation.parameters = paramObjs;
          if (requestBody && route.method !== 'get')
            operation.requestBody = requestBody;
          let newResponseSchema: GenOpenApiOption['responseSchema'];
          const returnSchema = method.returnSchema;
          if (returnSchema) {
            const responseMediaType =
              method.options?.mediaType ||
              controller.options?.mediaType ||
              '*/*';
            const isResponseTextPlain = responseMediaType === 'text/plain';
            if (responseSchema) {
              let haveResponseSchema = false;
              newResponseSchema = lodash.cloneDeep(responseSchema);
              const { properties = {} } = newResponseSchema!;
              Object.keys(properties).forEach((key: string) => {
                const propItem = properties[key];
                if (propItem === '#ResponseSchema') {
                  properties[key] = returnSchema;
                  haveResponseSchema = true;
                }
              });
              if (isResponseTextPlain) {
                // 返回类型为text/plain，返回字符串
                newResponseSchema = undefined;
              }
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
              [responseMediaType]: {
                schema:
                  newResponseSchema ??
                  (isResponseTextPlain ? { type: 'string' } : returnSchema),
              },
            };
          }

          const pathItem: oa.PathItemObject = {};
          pathItem[route.method] = operation;

          this.addPath(path, pathItem);
        });
      });
    });

    // add all referenced schemas
    const schemas = this.metadata.typeSchemas;
    for (const [name, schema] of Object.entries<oa.SchemaObject>(
      schemas.getSchemasData(),
    )) {
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
          // @ts-ignore
          paramObj.schema[key] = schema[key];
        } else {
          paramObj[key] = schema[key];
        }
      }
    }

    return paramObj;
  }
}
