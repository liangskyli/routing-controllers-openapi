import * as ts from 'typescript';
import * as TJS from 'typescript-json-schema';
import type { Controller } from './controller-generator';
import { ControllerGenerator } from './controller-generator';
import type { TypeSchemaMap } from './type-generator';
import { TypeGenerator } from './type-generator';

export class MetadataGenerator {
  program: ts.Program;
  typeChecker: ts.TypeChecker;
  typeGenerator: TypeGenerator;
  controllers: Controller[] = [];
  readonly typeUniqueNames: boolean;

  constructor(
    files: string[],
    jsonCompilerOptions: ts.CompilerOptions = {},
    typeUniqueNames: boolean = true,
  ) {
    this.typeUniqueNames = typeUniqueNames;
    this.program = TJS.getProgramFromFiles(files, jsonCompilerOptions);
    this.typeChecker = this.program.getTypeChecker();
    this.typeGenerator = new TypeGenerator(this);
  }

  get typeSchemas(): TypeSchemaMap {
    return this.typeGenerator.reffedSchemas;
  }

  public generate(): void {
    for (const sourceFile of this.program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        sourceFile.forEachChild((node) => {
          this.walkNodeTree(node);
        });
      }
    }
  }

  private walkNodeTree(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.name) {
      // only support have class name
      const symbol = this.typeChecker.getSymbolAtLocation(node.name);
      if (symbol) {
        const generator = new ControllerGenerator(node, this);
        if (generator.isValid()) {
          this.controllers.push(generator.generate());
        }
      }
    } else if (ts.isModuleDeclaration(node)) {
      // This is a namespace, visit its children
      node.forEachChild((n) => {
        this.walkNodeTree(n);
      });
    }
  }
}
