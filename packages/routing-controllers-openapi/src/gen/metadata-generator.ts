import * as ts from 'typescript';
import type { Controller } from './controller-generator';
import { ControllerGenerator } from './controller-generator';
import type { TypeSchemaMap } from './type-generator';
import { TypeGenerator } from './type-generator';

export class MetadataGenerator {
  program: ts.Program;
  typeChecker: ts.TypeChecker;
  typeGenerator: TypeGenerator;
  controllers: Controller[] = [];

  constructor(files: string[], jsonCompilerOptions: ts.CompilerOptions = {}) {
    const compilerOptions = ts.convertCompilerOptionsFromJson(
      jsonCompilerOptions,
      process.cwd(),
    ).options;
    const options: ts.CompilerOptions = {
      noEmit: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      allowUnusedLabels: true,
    };
    for (const k in compilerOptions) {
      if (compilerOptions.hasOwnProperty(k)) {
        options[k] = compilerOptions[k];
      }
    }

    this.program = ts.createProgram(files, options);
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

  /** True if this is visible outside this file, false otherwise */
  /*private isNodeExported(node: ts.Node): boolean {
        return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0
            || (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }*/

  private walkNodeTree(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.name) {
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
