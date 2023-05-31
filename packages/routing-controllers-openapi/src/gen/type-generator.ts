import { colors, lodash } from '@liangskyli/utils';
import type { oas31 as oa } from 'openapi3-ts';
import * as ts from 'typescript';
import type { Definition } from 'typescript-json-schema';
import * as TJS from 'typescript-json-schema';
import type { MetadataGenerator } from './metadata-generator';

const REGEX_FILE_NAME_OR_SPACE = /(\bimport\(".*?"\)|".*?")\.| /g;
const REGEX_FILE_NAME_OR_SPACE2 = /(\bimport\()(".*?")(\)|".*?")(\.)| /g;
export const REGEX_UNIQUE_MD5 = /([.])[0-9a-z]{8}$/g;

export type TypeSchema = oa.SchemaObject & Partial<oa.ReferenceObject>;

const PrimitiveTypeFlags =
  ts.TypeFlags.Number |
  ts.TypeFlags.Boolean |
  ts.TypeFlags.String |
  ts.TypeFlags.Null;
const refParsePrefix = '#/components/schemas/';
const REGEX_REF_PARSE_PREFIX = /^#\/components\/schemas\/(.+)$/;

const repeatRefName = new Map();

export class TypeSchemaMap {
  private idToSchemaData: Record<
    number,
    oa.SchemaObject | oa.ReferenceObject | undefined
  > = {};
  private readonly metadata: MetadataGenerator;
  private readonly generatorJsonSchema: TJS.JsonSchemaGenerator;
  private readonly uniqueGeneratorJsonSchema: TJS.JsonSchemaGenerator | null =
    null;

  private schemasData: oa.SchemasObject = {};

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

  getSchemasData(): oa.SchemasObject {
    return this.schemasData;
  }

  getSchemaByRef(ref: string): TypeSchema {
    // ref must begin with #/components/schemas/
    const name = ref.match(REGEX_REF_PARSE_PREFIX)![1];
    return this.schemasData[name] ?? {};
  }

  // 生成schema
  private genSchema(
    refName: string,
    generatorJsonSchema = this.generatorJsonSchema,
  ) {
    const processSchemas = (scope: Definition) => {
      delete scope.definitions;
      delete scope.$schema;
      (lodash.keys(scope) as (keyof typeof scope)[]).forEach((key) => {
        const value = scope[key];
        if (key === '$ref') {
          // ref change to openapi ref
          scope[key] = scope[key]?.replace(/#\/definitions\//g, refParsePrefix);
        }
        if (lodash.isObject(value)) {
          // continue processing sub schemas $ref
          processSchemas(value as any);
        }
      });
    };
    if (!this.schemasData[refName]) {
      try {
        const definition: Definition =
          generatorJsonSchema.getSchemaForSymbol(refName);
        (function fn(
          schemas: oa.SchemasObject,
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
    const processSchemas = (scope: Definition) => {
      delete scope.definitions;
      delete scope.$schema;
      (lodash.keys(scope) as (keyof typeof scope)[]).forEach((key) => {
        const value = scope[key];
        if (key === '$ref' && scope['$ref']) {
          // ref change to openapi ref
          const uniqueRefName = scope['$ref'].replace(/#\/definitions\//g, '');
          const noMd5Name = uniqueRefName.replace(REGEX_UNIQUE_MD5, '');
          const symbolList = this.generatorJsonSchema.getSymbols(noMd5Name);
          if (symbolList.length > 1) {
            // no unique symbol to use schemaObj
            this.genUniqueSchemaObj(uniqueRefName);
            scope = this.schemasData[uniqueRefName];
          } else if (symbolList.length === 1) {
            // only exist one symbol
            scope[key] = `${refParsePrefix}${noMd5Name}`;
            this.genSchema(noMd5Name);
          } else {
            // no symbol to use schemaObj
            this.genSchema(refName, this.uniqueGeneratorJsonSchema!);
            const schemasData = this.schemasData[uniqueRefName];
            delete scope.$ref;
            lodash.keys(schemasData).forEach((schemaKey) => {
              (scope as any)[schemaKey] = (schemasData as any)[schemaKey];
            });
          }
        }
        if (lodash.isObject(value)) {
          // continue processing sub schemas $ref
          processSchemas(value as any);
        }
      });
    };
    if (!this.schemasData[refName]) {
      try {
        const definition: Definition =
          this.uniqueGeneratorJsonSchema!.getSchemaForSymbol(refName);
        (function fn(
          schemas: oa.SchemasObject,
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
        console.error(
          colors.red(['Method::genUniqueSchemaObj', e.message].join(',')),
        );
      }
    }
  }

  getSchemaData(
    type: ts.Type,
    typeChecker: ts.TypeChecker,
  ): oa.SchemaObject | oa.ReferenceObject | undefined {
    let schemaData: oa.SchemaObject | oa.ReferenceObject | undefined;
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
          $ref: `${refParsePrefix}${baseName}`,
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
      return schemaData as TypeSchema;
    }

    let returnSchema = schema;

    if (!type.symbol) {
      if (type.flags & PrimitiveTypeFlags) {
        schema.type = (<any>type).intrinsicName;
      } else if (type.flags & ts.TypeFlags.BigInt) {
        // BigInt
        schema.type = 'integer';
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
      } else {
        schema.type = undefined;
        console.warn(
          colors.yellow('Unknown type: ' + this.typeChecker.typeToString(type)),
        );
      }
    } else if (type.flags & ts.TypeFlags.Object) {
      if (
        (<ts.ObjectType>type).objectFlags &
        (ts.ObjectFlags.Reference |
          ts.ObjectFlags.Anonymous |
          ts.ObjectFlags.Interface)
      ) {
        returnSchema =
          this.getClassTypeSchema(<ts.TypeReference>type, schema) ||
          returnSchema;
      } /*else if (
        (<ts.ObjectType>type).objectFlags & ts.ObjectFlags.Mapped
      ) {
        // 映射类型 todo
        //<ts.MappedTypeNode>type
        schema.type = 'object';
      }*/ else {
        schema.type = 'object';
        console.warn(
          colors.yellow(
            'Unknown Object type: ' + this.typeChecker.typeToString(type),
          ),
        );
      }
    } else {
      console.warn(
        colors.yellow(
          'Unknown symbol type: ' + this.typeChecker.typeToString(type),
        ),
      );
    }

    return returnSchema;
  }

  private getUnionTypeSchema(unionType: ts.UnionType, schema: TypeSchema) {
    const literalValues: (string | number)[] = [];
    const booleanLiteralValues: boolean[] = [];
    const schemas: TypeSchema[] = [];

    for (const subType of unionType.types) {
      if (subType.flags & ts.TypeFlags.StringOrNumberLiteral) {
        const value = (<ts.StringLiteralType | ts.NumberLiteralType>subType)
          .value;
        if (literalValues.indexOf(value) === -1) {
          literalValues.push(value);
        }
      } else if (subType.flags & ts.TypeFlags.BooleanLiteral) {
        const value = (<any>subType).intrinsicName === 'true';
        if (booleanLiteralValues.indexOf(value) === -1) {
          booleanLiteralValues.push(value);
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
        // multiple type
        type = ['string', 'number'];
      }
      schemas.push({
        type,
        enum: literalValues.sort(),
      });
    }
    if (booleanLiteralValues.length) {
      schemas.push({
        type: 'boolean',
        // when all boolean type, set enum undefined
        enum:
          booleanLiteralValues.length !== 2 ? booleanLiteralValues : undefined,
      });
    }

    if (schemas.length === 1) {
      for (const key in schemas[0]) {
        if (schemas[0].hasOwnProperty(key)) {
          // @ts-ignore
          schema[key] = schemas[0][key];
        }
      }
    } else {
      schema.anyOf = schemas;
    }
  }

  private getTupleTypeSchema(type: ts.TypeReference, schema: TypeSchema) {
    const items: TypeSchema[] = [];
    type.typeArguments?.forEach((item) => {
      items.push(this.getTypeSchema(item));
    });
    schema.items = items as any;
    schema.type = 'array';
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

    const typeDeclNode = type.symbol.declarations?.[0];
    const props = this.typeChecker.getPropertiesOfType(type);

    if (props.length) {
      for (const prop of props) {
        if (prop.flags & ts.SymbolFlags.Method) {
          // skip it
        } else if (prop.flags & ts.SymbolFlags.Property) {
          // also could be ts.PropertySignature
          const propDeclNode = <ts.PropertyDeclaration>prop.valueDeclaration;

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
    const resultFun = new Function(`return ${node.getText()}`);
    let resultValue: any = undefined;
    try {
      resultValue = resultFun();
    } catch {
      console.warn(colors.yellow('Unknown default value: ' + node.getText()));
    }
    return resultValue;
  }
}
