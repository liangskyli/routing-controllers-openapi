import type * as ts from 'typescript';
import type { DecoratorOptions } from './decorator-util';
import { DecoratorType, processDecorators } from './decorator-util';
import type { MetadataGenerator } from './metadata-generator';
import type { TypeSchema } from './type-generator';

export interface Parameter {
  name: string;
  schema: TypeSchema;
  options?: DecoratorOptions;
  required?: boolean;
}

export class ParameterGenerator implements Parameter {
  name: string;
  schema: TypeSchema = {};
  options?: DecoratorOptions;
  required?: boolean;

  private readonly node: ts.ParameterDeclaration;
  private readonly metadata: MetadataGenerator;

  constructor(node: ts.ParameterDeclaration, metadata: MetadataGenerator) {
    this.node = node;
    this.metadata = metadata;
    this.name = '';
    this.processDecorators();
  }

  public isValid(): boolean {
    return this.options !== undefined && this.options.paramIn !== undefined;
  }

  public generate(): Parameter {
    this.name = this.name || this.node.name.getText();
    this.processTokens();
    return this;
  }

  private processDecorators(): void {
    processDecorators(this.node, this.metadata, (decorator) => {
      if (decorator.type == DecoratorType.Param || decorator.type == DecoratorType.Body) {
        this.name = decorator.arguments?.[0];
        this.options = decorator.options;
        if (this.node.type) {
          const type = this.metadata.typeChecker.getTypeFromTypeNode(this.node.type);
          this.schema = this.metadata.typeGenerator.getTypeSchema(type);
        }
      } else if (decorator.type == DecoratorType.File) {
        this.name = decorator.arguments?.[0];
        this.options = decorator.options;
        this.schema = { type: 'string', format: 'binary' };
      }
    });
  }

  private processTokens() {
    if (this.node.initializer) {
      this.schema.default = this.metadata.typeGenerator.getInitializerValue(this.node.initializer);
    } else if (!this.node.questionToken) {
      this.required = true;
    }
  }
}
