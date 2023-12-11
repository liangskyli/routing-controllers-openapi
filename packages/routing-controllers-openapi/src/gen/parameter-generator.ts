import type ts from 'typescript';
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

export class ParameterGenerator {
  data: Omit<Parameter, 'schema'> & Pick<Partial<Parameter>, 'schema'>;

  private readonly node: ts.ParameterDeclaration;
  private readonly metadata: MetadataGenerator;

  constructor(node: ts.ParameterDeclaration, metadata: MetadataGenerator) {
    this.data = {
      name: '',
    };
    this.node = node;
    this.metadata = metadata;
    this.processDecorators();
  }

  private isValid(): boolean {
    return (
      this.data.schema !== undefined &&
      this.data.options !== undefined &&
      this.data.options.paramIn !== undefined
    );
  }

  public generate(): Parameter | undefined {
    if (!this.isValid()) {
      return undefined;
    }
    this.data.name = this.data.name || this.node.name.getText();
    this.processTokens();
    return this.data as unknown as Parameter;
  }

  private processDecorators(): void {
    processDecorators(this.node, this.metadata, (decorator) => {
      if (
        decorator.type === DecoratorType.Param ||
        decorator.type === DecoratorType.Body
      ) {
        this.data.name = decorator.arguments?.[0];
        this.data.options = decorator.options;
        if (this.node.type) {
          const type = this.metadata.typeChecker.getTypeFromTypeNode(
            this.node.type,
          );
          this.data.schema = this.metadata.typeGenerator.getTypeSchema(type);
        }
      } else if (decorator.type === DecoratorType.File) {
        this.data.name = decorator.arguments?.[0];
        this.data.options = decorator.options;
        if (this.data.options?.wholeParam) {
          this.data.schema = {
            type: 'object',
            properties: {
              [this.data.name]: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
            required: [this.data.name],
          };
        } else {
          this.data.schema = { type: 'string', format: 'binary' };
        }
      }
    });
  }

  private processTokens() {
    if (this.node.initializer && this.data.schema) {
      // if there has a default value, treat prop as optional
      this.data.schema.default =
        this.metadata.typeGenerator.getInitializerValue(this.node.initializer);
    } else if (!this.node.questionToken) {
      this.data.required = true;
    }
  }
}
