import * as ts from 'typescript';
import type { DecoratorOptions } from './decorator-util';
import { DecoratorType, processDecorators } from './decorator-util';
import type { MetadataGenerator } from './metadata-generator';
import type { Method } from './method-generator';
import { MethodGenerator } from './method-generator';

export interface Controller {
  name: string;
  route: string;
  description?: string;
  methods: Method[];
  options?: DecoratorOptions;
  //authorization?: string;
}

export class ControllerGenerator implements Controller {
  name: string;
  route: string;
  description: string;
  methods: Method[] = [];
  options?: DecoratorOptions;
  //authorization?: string;

  private _isValid?: boolean;
  private readonly node: ts.ClassDeclaration;
  private readonly metadata: MetadataGenerator;

  constructor(node: ts.ClassDeclaration, metadata: MetadataGenerator) {
    this.name = '';
    this.route = '';
    this.description = '';
    this.node = node;
    this.metadata = metadata;
    this.processDecorators();
  }

  public generate(): Controller {
    this.name = this.node.name!.text;
    this.processJSDocs();
    this.processMethods();
    return this;
  }

  public isValid() {
    return this._isValid === true;
  }

  private processDecorators() {
    processDecorators(this.node, this.metadata, (decorator) => {
      if (decorator.type === DecoratorType.Controller) {
        this.route = decorator.arguments?.[0] ?? '';
        this.options = decorator.options;
        this._isValid = true;
      } /*else if (decorator.type == DecoratorType.Authorization) {
        this.authorization = decorator.arguments?.[0] || '';
      }*/
    });
  }

  private processJSDocs() {
    const jsDocs: ts.JSDoc[] = (this.node as any).jsDoc;
    if (!jsDocs || jsDocs.length === 0) return;

    const jsDoc = jsDocs[0];
    if (typeof jsDoc.comment === 'string') {
      this.description = jsDoc.comment;
    }

    // TODO: process tags
  }

  private processMethods() {
    if (this.node.members && this.node.members.length) {
      this.node.members
        .filter((m) => ts.isMethodDeclaration(m))
        .forEach((member) => {
          const generator = new MethodGenerator(
            member as ts.MethodDeclaration,
            this.metadata,
            this.name,
          );
          if (generator.isValid()) {
            this.methods.push(generator.generate());
          }
        });
    }
  }
}
