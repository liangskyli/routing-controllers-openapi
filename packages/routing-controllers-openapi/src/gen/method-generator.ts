import type { oas31 as oa } from 'openapi3-ts';
import * as ts from 'typescript';
import type { DecoratorOptions } from './decorator-util';
import { DecoratorType, processDecorators } from './decorator-util';
import type { MetadataGenerator } from './metadata-generator';
import type { Parameter } from './parameter-generator';
import { ParameterGenerator } from './parameter-generator';
import type { TypeSchema } from './type-generator';

export type OpenapiMethod = keyof Pick<
  oa.PathItemObject,
  'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'
>;

interface Route {
  method: OpenapiMethod;
  route: string;
}
export interface Method {
  name: string;
  routes: Route[];
  summary?: string;
  description?: string;
  parameters: Parameter[];
  returnSchema: TypeSchema;
  options?: DecoratorOptions;
  //authorization?: string;
}

export class MethodGenerator implements Method {
  name: string = '';
  routes: Route[] = [];
  summary: string = '';
  description: string = '';
  parameters: Parameter[] = [];
  returnSchema: TypeSchema = {};
  options?: DecoratorOptions;
  //authorization?: string;

  private readonly node: ts.MethodDeclaration;
  private readonly metadata: MetadataGenerator;
  private readonly controllerName: string;

  constructor(
    node: ts.MethodDeclaration,
    metadata: MetadataGenerator,
    controllerName: string,
  ) {
    this.node = node;
    this.metadata = metadata;
    this.controllerName = controllerName;
    this.processDecorators();
  }

  public isValid() {
    return this.routes && this.routes.length;
  }

  public generate(): Method {
    this.name = (this.node.name as ts.Identifier).text;
    this.processParameters();
    this.processReturnType();
    this.processJSDocs();
    return this;
  }

  private processDecorators() {
    processDecorators(this.node, this.metadata, (decorator) => {
      if (decorator.type === DecoratorType.Action) {
        this.routes.push({
          method: decorator.name.toLowerCase() as OpenapiMethod,
          route: decorator.arguments?.[0] ?? '',
        });
        this.options = decorator.options;
      } /*else if (decorator.type === DecoratorType.Authorization) {
        this.authorization = decorator.arguments?[0] ?? '';
      }*/
    });
  }

  private processJSDocs() {
    this.description = `${this.controllerName}.${this.name}`;
    const jsDocs: ts.JSDoc[] = (this.node as any).jsDoc;
    if (!jsDocs || jsDocs.length === 0) return;

    const jsDoc = jsDocs[0];
    if (typeof jsDoc.comment === 'string') {
      this.summary = jsDoc.comment;
    }

    // TODO: process tags
  }

  private processParameters() {
    this.node.parameters
      .filter((m) => ts.isParameter(m))
      .forEach((parameter: ts.ParameterDeclaration) => {
        const generator = new ParameterGenerator(parameter, this.metadata);
        if (generator.isValid()) {
          this.parameters.push(generator.generate());
        }
      });
  }

  private processReturnType() {
    const type = this.metadata.typeChecker.getTypeFromTypeNode(this.node.type!);
    this.returnSchema = this.metadata.typeGenerator.getTypeSchema(type);
  }
}
