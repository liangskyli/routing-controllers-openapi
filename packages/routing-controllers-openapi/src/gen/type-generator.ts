import { colors, lodash } from '@liangskyli/utils';
import type { ReferenceObject, SchemaObject, SchemasObject } from 'openapi3-ts';
import * as ts from 'typescript';
import type { Definition } from 'typescript-json-schema';
import * as TJS from 'typescript-json-schema';
import { DecoratorType, processDecorators } from './decorator-util';
import type { MetadataGenerator } from './metadata-generator';

const REGEX_FILE_NAME_OR_SPACE = /(\bimport\(".*?"\)|".*?")\.| /g;
const REGEX_FILE_NAME_OR_SPACE2 = /(\bimport\()(".*?")(\)|".*?")(\.)| /g;
export const REGEX_UNIQUE_MD5 = /([.])[0-9a-z]{8}$/g;

export type TypeSchema = SchemaObject & Partial<ReferenceObject>;

type PrimitiveType = number | boolean | string | null;

const PrimitiveTypeFlags =
  ts.TypeFlags.Number |
  ts.TypeFlags.Boolean |
  ts.TypeFlags.String |
  ts.TypeFlags.Null;

const repeatRefName = new Map();

export class TypeSchemaMap {
  private idToSchemaData: Record<
    number,
    SchemaObject | ReferenceObject | undefined
  > = {};
  private readonly metadata: MetadataGenerator;
  private readonly generatorJsonSchema: TJS.JsonSchemaGenerator;
  private readonly uniqueGeneratorJsonSchema: TJS.JsonSchemaGenerator | null =
    null;

  private schemasData: SchemasObject = {};

  constructor(metadata: MetadataGenerator) {
    this.metadata = metadata;
    const jsonSchemaGeneratorData = TJS.buildGenerator(metadata.program, {
      required: true,
      ignoreErrors: true,
      uniqueNames: this.metadata.typeUniqueNames,
    });
    if (jsonSchemaGeneratorData) {
      this.generatorJsonSchema = jsonSchemaGeneratorData;
    } else {
      throw Error('generatorJsonSchema error');
    }
    if (!this.metadata.typeUniqueNames) {
      this.uniqueGeneratorJsonSchema = TJS.buildGenerator(metadata.program, {
        required: true,
        ignoreErrors: true,
        uniqueNames: true,
      });
    }
  }

  getSchemasData(): SchemasObject {
    return this.schemasData;
  }

  getSchemaByRef(ref: string): TypeSchema {
    const name = ref.match(/^#\/components\/schemas\/(.+)$/)?.[1] ?? '';
    return this.schemasData[name] ?? {};
  }

  // 生成schema
  private genSchema(refName: string) {
    const processSchemas = (scope: Record<string, any>) => {
      delete scope.definitions;
      delete scope.$schema;
      lodash.keys(scope).forEach((key) => {
        const value = scope[key];
        if (key === '$ref') {
          // ref change to openapi ref
          scope[key] = value.replace(
            /#\/definitions\//g,
            '#/components/schemas/',
          );
        }
        if (key === 'type' && lodash.isArray(value)) {
          /**
           "type":["string","number"] to
           "anyOf": [
             {"type": "string"},
             {"type": "number"}
            ],
           */
          scope.anyOf = value.map((item) => {
            return { type: item };
          });
          delete scope[key];
        }
        if (lodash.isObject(value)) {
          processSchemas(value);
        }
      });
    };
    if (!this.schemasData[refName]) {
      try {
        const definition: Definition =
          this.generatorJsonSchema.getSchemaForSymbol(refName);
        (function fn(
          schemas: Record<string, SchemaObject | ReferenceObject>,
          definitions: Definition['definitions'] = {},
        ): void {
          Object.keys(definitions).forEach((name) => {
            const scope = definitions[name];
            if (!schemas[name] && typeof scope === 'object') {
              const definitionsScope = scope.definitions;
              processSchemas(scope);
              schemas[name] = scope as any;
              fn(schemas, definitionsScope);
            }
          });
        })(this.schemasData, { [refName]: definition });
      } catch (e: any) {
        console.error(colors.red(['Method::genSchema', e.message].join(',')));
      }
    }
  }

  // 生成schemaObj
  private genUniqueSchemaObj(refName: string) {
    const processSchemas = (scope: Record<string, any>) => {
      delete scope.definitions;
      delete scope.$schema;
      lodash.keys(scope).forEach((key) => {
        const value = scope[key];
        if (key === '$ref') {
          // ref change to openapi ref
          const uniqueRefName = value.replace(/#\/definitions\//g, '');
          const noMd5Name = uniqueRefName.replace(REGEX_UNIQUE_MD5, '');
          const symbolList = this.generatorJsonSchema.getSymbols(noMd5Name);
          if (symbolList.length > 1) {
            // no unique to use schemaObj
            this.genUniqueSchemaObj(uniqueRefName);
            scope = this.schemasData[uniqueRefName];
          } else {
            scope[key] = `#/components/schemas/${noMd5Name}`;
            this.genSchema(noMd5Name);
          }
        }
        if (key === 'type' && lodash.isArray(value)) {
          /**
           "type":["string","number"] to
           "anyOf": [
           {"type": "string"},
           {"type": "number"}
           ],
           */
          scope.anyOf = value.map((item) => {
            return { type: item };
          });
          delete scope[key];
        }
        if (lodash.isObject(value)) {
          processSchemas(value);
        }
      });
    };
    if (!this.schemasData[refName]) {
      try {
        const definition: Definition =
          this.uniqueGeneratorJsonSchema!.getSchemaForSymbol(refName);
        (function fn(
          schemas: Record<string, SchemaObject | ReferenceObject>,
          definitions: Definition['definitions'] = {},
        ): void {
          // eslint-disable-next-line array-callback-return
          Object.keys(definitions).map((name) => {
            const scope = definitions[name];
            if (!schemas[name] && typeof scope === 'object') {
              const definitionsScope = scope.definitions;
              processSchemas(scope);
              schemas[name] = scope as any;
              fn(schemas, definitionsScope);
            }
          });
        })(this.schemasData, { [refName]: definition });
      } catch (e: any) {
        console.error(
          colors.red(['Method::genUniqueSchemaObj', e.message].join(',')),
        );
      }
    }
  }

  getSchemaData(
    type: ts.Type,
    typeChecker: ts.TypeChecker,
  ): SchemaObject | ReferenceObject | undefined {
    let schemaData: SchemaObject | ReferenceObject | undefined;
    const id = (type as any).id as number;
    if (this.idToSchemaData[id]) {
      return this.idToSchemaData[id];
    }

    const fullyName = typeChecker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation |
        ts.TypeFormatFlags.UseFullyQualifiedType,
    );

    const curFullyQualifiedName = fullyName.replace(
      REGEX_FILE_NAME_OR_SPACE2,
      '$2$4',
    );
    let baseName = fullyName.replace(REGEX_FILE_NAME_OR_SPACE, '');

    const symbolList = this.generatorJsonSchema.getSymbols(baseName);
    if (symbolList.length > 0) {
      if (this.metadata.typeUniqueNames) {
        // use unique baseName
        symbolList.forEach((item) => {
          if (item.fullyQualifiedName === curFullyQualifiedName) {
            baseName = item.name;
          }
        });
      } else {
        if (symbolList.length > 1) {
          // save repeatRefName
          if (!repeatRefName.has(baseName)) {
            repeatRefName.set(baseName, baseName);
          }
        }
      }

      if (this.metadata.typeUniqueNames || !repeatRefName.has(baseName)) {
        schemaData = {
          $ref: `#/components/schemas/${baseName}`,
        };

        this.genSchema(baseName);
      }
      if (!this.metadata.typeUniqueNames && symbolList.length > 1) {
        // get SchemaObject from Unique ref
        const uniqueSymbolList =
          this.uniqueGeneratorJsonSchema!.getSymbols(baseName);
        let curUniqueName = '';
        uniqueSymbolList.forEach((item) => {
          if (item.fullyQualifiedName === curFullyQualifiedName) {
            curUniqueName = item.name;
          }
        });
        this.genUniqueSchemaObj(curUniqueName);
        schemaData = this.schemasData[curUniqueName];
      }
    }
    this.idToSchemaData[id] = schemaData;

    return schemaData;
  }
}

export class TypeGenerator {
  reffedSchemas: TypeSchemaMap;
  private readonly metadata: MetadataGenerator;
  private readonly typeChecker: ts.TypeChecker;

  constructor(metadata: MetadataGenerator) {
    this.metadata = metadata;
    this.typeChecker = metadata.typeChecker;
    this.reffedSchemas = new TypeSchemaMap(this.metadata);
  }

  public getTypeSchema(type: ts.Type, schema: TypeSchema = {}): TypeSchema {
    const schemaData = this.reffedSchemas.getSchemaData(type, this.typeChecker);
    if (schemaData) {
      return schemaData;
    }

    let returnSchema = schema;

    if (!type.symbol) {
      if (type.flags & (PrimitiveTypeFlags | ts.TypeFlags.Literal)) {
        this.getPrimitiveTypeSchema(type, schema);
      } else if (type.flags & ts.TypeFlags.Union) {
        // 联合类型
        this.getUnionTypeSchema(<ts.UnionType>type, schema);
      } else if (type.flags & ts.TypeFlags.Void) {
        schema.type = undefined;
      } else if (type.flags & ts.TypeFlags.Intersection) {
        // 交叉类型
        this.getIntersectionTypeSchema(<ts.IntersectionType>type, schema);
      } else if (
        type.flags & ts.TypeFlags.Object &&
        (<ts.ObjectType>type).objectFlags & ts.ObjectFlags.Reference
      ) {
        // 元祖类型
        this.getTupleTypeSchema(<ts.TypeReference>type, schema);
      } else if (
        type.flags & ts.TypeFlags.NonPrimitive &&
        (<any>type).intrinsicName === 'object'
      ) {
        // 'object' type
        schema.type = 'object';
      } else {
        schema.type = undefined;
        console.warn(
          colors.yellow('Unknown type: ' + this.typeChecker.typeToString(type)),
        );
      }
    } else if (type.flags & ts.TypeFlags.Object) {
      if (
        (<ts.ObjectType>type).objectFlags &
        (ts.ObjectFlags.Reference | ts.ObjectFlags.Anonymous)
      ) {
        returnSchema =
          this.getClassTypeSchema(<ts.TypeReference>type, schema) ||
          returnSchema;
      } else if (
        (<ts.ObjectType>type).objectFlags & ts.ObjectFlags.Interface &&
        this.typeChecker.typeToString(type) === 'Date'
      ) {
        schema.type = 'string';
        schema.format = 'date-time';
      } else {
        console.warn(
          colors.yellow('Unknown type ' + this.typeChecker.typeToString(type)),
        );
      }
    } else if (type.flags & ts.TypeFlags.Union) {
      // enum type
      this.getUnionTypeSchema(<ts.UnionType>type, schema);
    } else {
      console.warn(
        colors.yellow('Unknown type ' + this.typeChecker.typeToString(type)),
      );
    }

    //return returnSchema;
    return schema.type === 'null' ? {} : returnSchema;
  }

  private getPrimitiveTypeSchema(type: ts.Type, schema: TypeSchema) {
    if (type.flags & PrimitiveTypeFlags) {
      schema.type = (<any>type).intrinsicName;
    } else if (type.flags & ts.TypeFlags.StringOrNumberLiteral) {
      const value = (<ts.LiteralType>type).value;
      // @ts-ignore
      schema.type = typeof value;
      schema.enum = [value];
      schema.default = value;
    } else if (type.flags & ts.TypeFlags.BooleanLiteral) {
      schema.type = 'boolean';
      schema.enum = [(<any>type).intrinsicName === 'true'];
    } else {
      console.warn(
        colors.yellow('Unknown type ' + this.typeChecker.typeToString(type)),
      );
    }
  }

  private getUnionTypeSchema(unionType: ts.UnionType, schema: TypeSchema) {
    const literalValues: PrimitiveType[] = [];
    const schemas: TypeSchema[] = [];

    for (const subType of unionType.types) {
      let value: any;
      if (subType.flags & ts.TypeFlags.StringOrNumberLiteral) {
        value = (<ts.LiteralType>subType).value;
        if (literalValues.indexOf(value) === -1) {
          literalValues.push(value);
        }
      } else {
        const subSchema = this.getTypeSchema(subType);
        schemas.push(subSchema);
      }
    }

    if (literalValues.length) {
      let type: TypeSchema['type'];
      if (literalValues.every((x) => typeof x === 'string')) {
        type = 'string';
      } else if (literalValues.every((x) => typeof x === 'number')) {
        type = 'number';
      } else {
        console.warn(
          colors.yellow(
            'Multiple type not supported at ' +
              this.typeChecker.typeToString(unionType),
          ),
        );
      }
      schemas.push({ type, enum: literalValues.sort() });
    }

    if (schemas.length === 1) {
      for (const key in schemas[0]) {
        if (schemas[0].hasOwnProperty(key)) {
          schema[key] = schemas[0][key];
        }
      }
    } else {
      schema.anyOf = schemas;
    }
  }

  private getTupleTypeSchema(type: ts.TypeReference, schema: TypeSchema) {
    const subType = type.typeArguments?.[0];
    if (
      !type.typeArguments?.length ||
      !type.typeArguments.every((st) => st === subType)
    ) {
      console.warn(
        colors.yellow(
          'Multiple type in tuple is not support, ' +
            this.typeChecker.typeToString(type),
        ),
      );
    }

    schema.type = 'array';
    schema.items = this.getTypeSchema(subType!);
    schema.minItems = schema.maxItems = type.typeArguments?.length;
  }

  private getIntersectionTypeSchema(
    type: ts.IntersectionType,
    schema: TypeSchema,
  ) {
    schema.type = 'object';
    schema.allOf = [];
    for (const subType of type.types) {
      schema.allOf.push(this.getTypeSchema(subType));
    }
  }

  private getClassTypeSchema(
    type: ts.TypeReference,
    schema: TypeSchema,
  ): TypeSchema | void {
    if (type.typeArguments && type.typeArguments.length) {
      return this.getGenericTypeSchema(type, schema);
    }
    schema.type = 'object';
    schema.properties = {};

    const typeDeclNode = type.symbol.declarations
      ? type.symbol.declarations[0]
      : undefined;
    const props = this.typeChecker.getPropertiesOfType(type);
    let hiddenClass = false;
    if (typeDeclNode) {
      processDecorators(typeDeclNode, this.metadata, (decorator) => {
        if (decorator.type === DecoratorType.Exclude) {
          hiddenClass = true;
        }
      });
    }

    if (props.length) {
      for (const prop of props) {
        if (prop.flags & ts.SymbolFlags.Method) {
          // skip it
        } else if (prop.flags & ts.SymbolFlags.Property) {
          // also could be ts.PropertySignature
          const propDeclNode = <ts.PropertyDeclaration>prop.valueDeclaration;

          let hiddenProp = hiddenClass;
          processDecorators(propDeclNode, this.metadata, (decorator) => {
            if (decorator.type === DecoratorType.Exclude) hiddenProp = true;
            else if (decorator.type === DecoratorType.Expose)
              hiddenProp = false;
          });
          for (const tag of prop.getJsDocTags() || []) {
            if (tag.name === 'internal') {
              hiddenProp = true;
              break;
            }
          }
          if (hiddenProp) continue;

          const subType = this.typeChecker.getTypeOfSymbolAtLocation(
            prop,
            typeDeclNode!,
          );
          const subSchema = (schema.properties[prop.name] =
            this.getTypeSchema(subType));

          const comments = prop.getDocumentationComment(this.typeChecker);
          if (comments.length) {
            subSchema.description = ts.displayPartsToString(comments).trim();
          }

          if (propDeclNode.initializer) {
            subSchema.default = this.getInitializerValue(
              propDeclNode.initializer,
            );
            // if there has a default value, treat prop as optional
          } else if (!propDeclNode.questionToken) {
            if (!schema.required) {
              schema.required = [];
            }
            schema.required.push(prop.name);
          }
        } else {
          console.warn(colors.yellow('Unknown symbol ' + prop.name));
        }
      }
    } else if (!(type.symbol.flags & ts.SymbolFlags.TypeLiteral)) {
      console.warn(colors.yellow('no members in class declaration'));
    }
  }

  private getGenericTypeSchema(
    type: ts.TypeReference,
    schema: TypeSchema,
  ): TypeSchema | void {
    if (type.symbol.name === 'Promise' && type.typeArguments?.length === 1) {
      return this.getTypeSchema(type.typeArguments[0], schema);
    } else if (
      type.symbol.name === 'Array' &&
      type.typeArguments?.length === 1
    ) {
      schema.type = 'array';
      schema.items = this.getTypeSchema(type.typeArguments[0]);
    } else if (type.symbol.name === 'Map' && type.typeArguments?.length === 2) {
      schema.type = 'object';
      schema.properties = {};
      schema.additionalProperties = this.getTypeSchema(type.typeArguments[1]);
      // need handle 'K' type?
    } else {
      console.warn(
        colors.yellow(
          'Unknown generic type ' + this.typeChecker.typeToString(type),
        ),
      );
    }
  }

  public getInitializerValue(node: ts.Expression): any {
    switch (node.kind) {
      case ts.SyntaxKind.ArrayLiteralExpression:
        return (<ts.ArrayLiteralExpression>node).elements.map((e) =>
          this.getInitializerValue(e),
        );
      case ts.SyntaxKind.NumericLiteral:
        return Number((<ts.NumericLiteral>node).text);
      case ts.SyntaxKind.StringLiteral:
        return (<ts.StringLiteral>node).text;
      case ts.SyntaxKind.TrueKeyword:
        return true;
      case ts.SyntaxKind.FalseKeyword:
        return false;
      default:
        console.warn(colors.yellow('Unknown default value ' + node.getText()));
    }
  }
}
