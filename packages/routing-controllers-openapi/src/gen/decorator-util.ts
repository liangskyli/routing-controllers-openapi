import { colors } from '@liangskyli/utils';
import type { oas31 as oa } from 'openapi3-ts';
import { ts } from 'typescript-json-schema';
import type { MetadataGenerator } from './metadata-generator';

export enum DecoratorType {
  Unknown,
  Controller,
  Action,
  Param,
  Body,
  File,
  Authorization,
  //Exclude,
  //Expose,
  Omit,
}

export const defaultRoutingControllersPackageName = 'routing-controllers';
export class RoutingControllersPackage {
  static packageName: string = 'RoutingControllers';
  static knownDecorators: DecoratorMetadata[] = [];
  static allOmitDecorators: DecoratorMetadata[] = [];

  static setPackageName(packageName: string): void {
    this.packageName = packageName;
    this.knownDecorators = [
      {
        package: packageName,
        name: 'Controller',
        type: DecoratorType.Controller,
        options: {
          mediaType: 'text/plain',
        },
      },
      {
        package: packageName,
        name: 'JsonController',
        type: DecoratorType.Controller,
        options: {
          mediaType: 'application/json',
        },
      },
      {
        package: packageName,
        name: 'Get',
        type: DecoratorType.Action,
      },
      {
        package: packageName,
        name: 'Put',
        type: DecoratorType.Action,
      },
      {
        package: packageName,
        name: 'Post',
        type: DecoratorType.Action,
      },
      {
        package: packageName,
        name: 'Delete',
        type: DecoratorType.Action,
      },
      {
        package: packageName,
        name: 'Head',
        type: DecoratorType.Action,
      },
      {
        package: packageName,
        name: 'Patch',
        type: DecoratorType.Action,
      },
      {
        package: packageName,
        name: 'Param',
        type: DecoratorType.Param,
        options: {
          paramIn: 'path',
        },
      },
      {
        package: packageName,
        name: 'Params',
        type: DecoratorType.Param,
        options: {
          paramIn: 'path',
          wholeParam: true,
        },
      },
      {
        package: packageName,
        name: 'QueryParam',
        type: DecoratorType.Param,
        options: {
          paramIn: 'query',
        },
      },
      {
        package: packageName,
        name: 'QueryParams',
        type: DecoratorType.Param,
        options: {
          paramIn: 'query',
          wholeParam: true,
        },
      },
      {
        package: packageName,
        name: 'HeaderParam',
        type: DecoratorType.Param,
        options: {
          paramIn: 'header',
        },
      },
      {
        package: packageName,
        name: 'HeaderParams',
        type: DecoratorType.Param,
        options: {
          paramIn: 'header',
          wholeParam: true,
        },
      },
      {
        package: packageName,
        name: 'CookieParam',
        type: DecoratorType.Param,
        options: {
          paramIn: 'cookie',
        },
      },
      {
        package: packageName,
        name: 'CookieParams',
        type: DecoratorType.Param,
        options: {
          paramIn: 'cookie',
          wholeParam: true,
        },
      },
      {
        package: packageName,
        name: 'BodyParam',
        type: DecoratorType.Body,
        options: {
          paramIn: 'body',
          mediaType: 'application/json',
        },
      },
      {
        package: packageName,
        name: 'Body',
        type: DecoratorType.Body,
        options: {
          paramIn: 'body',
          mediaType: 'application/json',
          wholeParam: true,
        },
      },
      {
        package: packageName,
        name: 'UploadedFile',
        type: DecoratorType.File,
        options: {
          mediaType: 'multipart/form-data',
          paramIn: 'body',
        },
      },
      {
        package: packageName,
        name: 'UploadedFiles',
        type: DecoratorType.File,
        options: {
          mediaType: 'multipart/form-data',
          paramIn: 'body',
          wholeParam: true,
        },
      },
      /*{
        package: packageName,
        name: 'Authorized',
        type: DecoratorType.Authorization,
      },*/
    ];
    const omitRoutingControllersName = [
      'Ctx',
      'CurrentUser',
      'Interceptor',
      'Header',
      'Middleware',
      'Session',
      'SessionParam',
      'State',
      'UseAfter',
      'UseBefore',
      'UseInterceptor',
    ];
    this.allOmitDecorators = omitRoutingControllersName.map((name) => {
      return {
        package: packageName,
        name: name,
        type: DecoratorType.Omit,
      };
    });
  }

  static getKnownDecorators(): DecoratorMetadata[] {
    return this.knownDecorators;
  }
  static getOmitDecorators(): DecoratorMetadata[] {
    return this.allOmitDecorators;
  }
  static addOmitDecorator(item: DecoratorMetadata): void {
    this.allOmitDecorators.push(item);
  }
}

// init default RoutingControllers packageName
RoutingControllersPackage.setPackageName(defaultRoutingControllersPackageName);

export interface DecoratorMetadata {
  name: string;
  package: string;
  type: DecoratorType;
  options?: DecoratorOptions;
}

export interface DecoratorOptions {
  mediaType?: string;
  paramIn?: oa.ParameterLocation | 'body';
  wholeParam?: boolean;
}

class Decorator implements DecoratorMetadata {
  name: string;
  package: string;
  type: DecoratorType = DecoratorType.Unknown;
  options: DecoratorOptions;
  arguments: string[] = [];

  private readonly node: ts.Decorator;
  private readonly metadata: MetadataGenerator;

  constructor(decoratorNode: ts.Decorator, metadata: MetadataGenerator) {
    this.node = decoratorNode;
    this.metadata = metadata;
    this.options = {};
    const typeChecker = metadata.typeChecker;
    const sourceFileToPackageName: Map<string, string> = (<any>metadata.program)
      .sourceFileToPackageName;
    const expression = <ts.CallExpression>this.node.expression;
    const signature = typeChecker.getResolvedSignature(expression);
    const declaration = signature?.getDeclaration() as ts.FunctionDeclaration;
    const fileName = declaration.getSourceFile().fileName;
    this.name = declaration.name?.text ?? '';
    if (this.name === '') {
      this.name = expression.expression.getText();
    }
    this.package =
      sourceFileToPackageName.get(
        ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
      ) ?? '';
    this.findDecorator();
    this.setArguments();
  }

  private findDecorator() {
    const knownDecorators = RoutingControllersPackage.getKnownDecorators();
    for (const d of knownDecorators) {
      if (d.name === this.name && this.package?.indexOf(d.package) === 0) {
        this.type = d.type;
        this.options = d.options || {};
        return;
      }
    }

    const omitDecorators = RoutingControllersPackage.getOmitDecorators();
    for (const d of omitDecorators) {
      if (d.name === this.name && this.package.indexOf(d.package) === 0) {
        this.type = d.type;
        return;
      }
    }

    const sourceFile = this.node.getSourceFile();
    const pos = sourceFile.getLineAndCharacterOfPosition(
      this.node.getStart(sourceFile),
    );
    console.warn(
      colors.yellow(
        `Decorator unknown: ${this.package}.${this.name}: ${
          sourceFile.fileName
        }(${pos.line + 1},${pos.character + 1})`,
      ),
    );
  }

  private setArguments() {
    const expression = <ts.CallExpression>this.node.expression;
    const args = expression.arguments;
    if (!args || !args.length) return;

    for (const argNode of args) {
      if (ts.isStringLiteral(argNode)) {
        this.arguments.push(argNode.text);
      }
    }
  }
}

export function processDecorators(
  node: ts.Node,
  metadata: MetadataGenerator,
  cb: (decorator: Decorator) => void,
) {
  const decorators = ts.canHaveDecorators(node)
    ? ts.getDecorators(node)
    : undefined;
  if (!decorators) {
    return;
  }

  decorators.forEach((decorator) => {
    const decoratorMetadata = new Decorator(decorator, metadata);
    cb(decoratorMetadata);
  });
}
