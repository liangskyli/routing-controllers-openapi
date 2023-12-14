import { dump } from 'js-yaml';
import { oas31 as oa } from 'openapi3-ts';
import type { OpenapiMethod } from '../gen/method-generator';
import { fileTip } from '../utils';

export class OpenapiBuilder extends oa.OpenApiBuilder {
  constructor() {
    super();
    this.rootDoc = {
      openapi: '3.1.0',
      info: {
        title: '',
        license: { name: fileTip },
        version: '',
      },
    };
  }

  getSpecAsYaml(): string {
    return dump(this.getSpec());
  }

  public addPath(path: string, pathItem: oa.PathItemObject): oa.OpenApiBuilder {
    this.rootDoc.paths = this.rootDoc.paths || {};
    if (this.rootDoc.paths[path] !== undefined) {
      Object.keys(this.rootDoc.paths[path]).forEach((method) => {
        if (pathItem[method as OpenapiMethod]) {
          throw new Error(`exist path "${path}" have same method "${method}"`);
        }
      });
      this.rootDoc.paths[path] = { ...this.rootDoc.paths[path], ...pathItem };
    } else {
      this.rootDoc.paths[path] = pathItem;
    }
    return this;
  }
}
