import { dump } from 'js-yaml';
import { oas31 as oa } from 'openapi3-ts';
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
      throw new Error(`exist path "${path}"`);
    }
    this.rootDoc.paths[path] = pathItem;
    return this;
  }
}
