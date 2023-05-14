import { colors } from '@liangskyli/utils';
import type { oas31 as oa } from 'openapi3-ts';
import * as ts from 'typescript';
import type { MetadataGenerator } from './metadata-generator';

export enum DecoratorType {
  Unknown,
  Controller,
  Action,
  Param,
  Body,
  File,
  Authorization,
  Exclude,
  Expose,
  Omit,
}

const knownDecorators: DecoratorMetadata[] = [
  {
    package: 'routing-controllers',
    name: 'Controller',
    type: DecoratorType.Controller,
    options: {
      mediaType: 'text/plain',
    },
  },
  {
    package: 'routing-controllers',
    name: 'JsonController',
    type: DecoratorType.Controller,
    options: {
      mediaType: 'application/json',
    },
  },
  {
    package: 'routing-controllers',
    name: 'Get',
    type: DecoratorType.Action,
  },
  {
    package: 'routing-controllers',
    name: 'Put',
    type: DecoratorType.Action,
  },
  {
    package: 'routing-controllers',
    name: 'Post',
    type: DecoratorType.Action,
  },
  {
    package: 'routing-controllers',
    name: 'Delete',
    type: DecoratorType.Action,
  },
  {
    package: 'routing-controllers',
    name: 'Head',
    type: DecoratorType.Action,
  },
  {
    package: 'routing-controllers',
    name: 'Patch',
    type: DecoratorType.Action,
  },
  {
    package: 'routing-controllers',
    name: 'Param',
    type: DecoratorType.Param,
    options: {
      paramIn: 'path',
    },
  },
  {
    package: 'routing-controllers',
    name: 'Params',
    type: DecoratorType.Param,
    options: {
      paramIn: 'path',
      wholeParam: true,
    },
  },
  {
    package: 'routing-controllers',
    name: 'QueryParam',
    type: DecoratorType.Param,
    options: {
      paramIn: 'query',
    },
  },
  {
    package: 'routing-controllers',
    name: 'QueryParams',
    type: DecoratorType.Param,
    options: {
      paramIn: 'query',
      wholeParam: true,
    },
  },
  {
    package: 'routing-controllers',
    name: 'HeaderParam',
    type: DecoratorType.Param,
    options: {
      paramIn: 'header',
    },
  },
  {
    package: 'routing-controllers',
    name: 'HeaderParams',
    type: DecoratorType.Param,
    options: {
      paramIn: 'header',
      wholeParam: true,
    },
  },
  {
    package: 'routing-controllers',
    name: 'CookieParam',
    type: DecoratorType.Param,
    options: {
      paramIn: 'cookie',
    },
  },
  {
    package: 'routing-controllers',
    name: 'CookieParams',
    type: DecoratorType.Param,
    options: {
      paramIn: 'cookie',
      wholeParam: true,
    },
  },
  {
    package: 'routing-controllers',
    name: 'BodyParam',
    type: DecoratorType.Body,
    options: {
      paramIn: 'body',
      mediaType: 'application/json',
    },
  },
  {
    package: 'routing-controllers',
    name: 'Body',
    type: DecoratorType.Body,
    options: {
      paramIn: 'body',
      mediaType: 'application/json',
      wholeParam: true,
    },
  },
  {
    package: 'routing-controllers',
    name: 'UploadedFile',
    type: DecoratorType.File,
    options: {
      mediaType: 'multipart/form-data',
      paramIn: 'body',
    },
  },
  {
    package: 'routing-controllers',
    name: 'UploadedFiles',
    type: DecoratorType.File,
    options: {
      mediaType: 'multipart/form-data',
      paramIn: 'body',
      wholeParam: true,
    },
  },
  /*{
    package: 'routing-controllers',
    name: 'Authorized',
    type: DecoratorType.Authorization,
  },*/
];

const getOmitDecorators: () => DecoratorMetadata[] = () => {
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
  return omitRoutingControllersName.map((name) => {
    return {
      package: 'routing-controllers',
      name: name,
      type: DecoratorType.Omit,
    };
  });
};

export const omitDecorators = getOmitDecorators();

export interface DecoratorMetadata {
  name: string;
  package: string;
  type: DecoratorType;
  options?: DecoratorOptions;
  arguments?: string[];
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
    const sourceFileToPackageName: ts.Map<string> = (<any>metadata.program)
      .sourceFileToPackageName;
    const signature = typeChecker.getResolvedSignature(
      <ts.CallExpression>this.node.expression,
    );
    const declaration = signature?.getDeclaration() as ts.FunctionDeclaration;
    const fileName = declaration.getSourceFile().fileName;
    this.name = declaration.name?.text ?? '';
    this.package =
      sourceFileToPackageName.get(
        ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
      ) ?? '';
    this.findDecorator();
    this.setArguments();
  }

  private findDecorator() {
    for (const d of knownDecorators) {
      if (d.name === this.name && this.package?.indexOf(d.package) === 0) {
        this.type = d.type;
        this.options = d.options || {};
        return;
      }
    }

    for (const d of omitDecorators) {
      if (d.name === this.name && this.package?.indexOf(d.package) === 0) {
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
  if (!decorators || !decorators.length) {
    return;
  }

  decorators.forEach((decorator) => {
    const decoratorMetadata = new Decorator(decorator, metadata);
    cb(decoratorMetadata);
  });
}
