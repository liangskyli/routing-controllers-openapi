import { dump } from 'js-yaml';
import type { oas31 as oa } from 'openapi3-ts';
import { fileTip } from '../utils';

export class OpenapiBuilder implements oa.OpenApiBuilder {
  rootDoc: oa.OpenAPIObject;

  public static create(): oa.OpenApiBuilder {
    return new OpenapiBuilder();
  }

  constructor() {
    this.rootDoc = {
      openapi: '3.1.0',
      info: {
        title: '',
        license: { name: fileTip },
        version: '',
      },
      paths: {},
      components: {},
    };
  }

  public getSpec(): oa.OpenAPIObject {
    return this.rootDoc;
  }

  getSpecAsJson(
    replacer?: (key: string, value: any) => any,
    space?: string | number,
  ): string {
    return JSON.stringify(this.getSpec(), replacer, space);
  }

  getSpecAsYaml(): string {
    return dump(this.getSpec());
  }

  //private static isValidOpenApiVersion(v?) {}

  public addOpenApiVersion(openApiVersion: string): oa.OpenApiBuilder {
    this.rootDoc.openapi = openApiVersion;
    return this;
  }

  public addInfo(info: oa.InfoObject): oa.OpenApiBuilder {
    this.rootDoc.info = info;
    return this;
  }

  public addContact(contact: oa.ContactObject): oa.OpenApiBuilder {
    this.rootDoc.info.contact = contact;
    return this;
  }
  public addLicense(license: oa.LicenseObject): oa.OpenApiBuilder {
    this.rootDoc.info.license = license;
    return this;
  }
  public addTitle(title: string): oa.OpenApiBuilder {
    this.rootDoc.info.title = title;
    return this;
  }

  public addDescription(description: string): oa.OpenApiBuilder {
    this.rootDoc.info.description = description;
    return this;
  }

  public addTermsOfService(termsOfService: string): oa.OpenApiBuilder {
    this.rootDoc.info.termsOfService = termsOfService;
    return this;
  }

  public addVersion(version: string): oa.OpenApiBuilder {
    this.rootDoc.info.version = version;
    return this;
  }

  public addPath(path: string, pathItem: oa.PathItemObject): oa.OpenApiBuilder {
    if (this.rootDoc.paths![path] !== undefined) {
      throw new Error(`exist path "${path}"`);
    }
    this.rootDoc.paths![path] = pathItem;
    return this;
  }

  public addSchema(name: string, schema: oa.SchemaObject): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.schemas === undefined) {
      this.rootDoc.components.schemas = {};
    }
    if (this.rootDoc.components.schemas[name] !== undefined) {
      throw new Error(`exist schema "${name}"`);
    }
    this.rootDoc.components.schemas[name] = schema;
    return this;
  }

  public addResponse(
    name: string,
    response: oa.ResponseObject,
  ): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.responses === undefined) {
      this.rootDoc.components.responses = {};
    }
    if (this.rootDoc.components.responses[name] !== undefined) {
      throw new Error(`exist response "${name}"`);
    }
    this.rootDoc.components.responses[name] = response;
    return this;
  }

  public addParameter(
    name: string,
    parameter: oa.ParameterObject,
  ): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.parameters === undefined) {
      this.rootDoc.components.parameters = {};
    }
    if (this.rootDoc.components.parameters[name] !== undefined) {
      throw new Error(`exist parameter "${name}"`);
    }
    this.rootDoc.components.parameters[name] = parameter;
    return this;
  }

  public addExample(
    name: string,
    example: oa.ExampleObject,
  ): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.examples === undefined) {
      this.rootDoc.components.examples = {};
    }
    if (this.rootDoc.components.examples[name] !== undefined) {
      throw new Error(`exist example "${name}"`);
    }
    this.rootDoc.components.examples[name] = example;
    return this;
  }

  public addRequestBody(
    name: string,
    reqBody: oa.RequestBodyObject,
  ): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.requestBodies === undefined) {
      this.rootDoc.components.requestBodies = {};
    }
    if (this.rootDoc.components.requestBodies[name] !== undefined) {
      throw new Error(`exist requestBody "${name}"`);
    }
    this.rootDoc.components.requestBodies[name] = reqBody;
    return this;
  }

  public addHeader(name: string, header: oa.HeaderObject): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.headers === undefined) {
      this.rootDoc.components.headers = {};
    }
    if (this.rootDoc.components.headers[name] !== undefined) {
      throw new Error(`exist header "${name}"`);
    }
    this.rootDoc.components.headers[name] = header;
    return this;
  }

  public addSecurityScheme(
    name: string,
    secScheme: oa.SecuritySchemeObject,
  ): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.securitySchemes === undefined) {
      this.rootDoc.components.securitySchemes = {};
    }
    if (this.rootDoc.components.securitySchemes[name] !== undefined) {
      throw new Error(`exist securityScheme "${name}"`);
    }
    this.rootDoc.components.securitySchemes[name] = secScheme;
    return this;
  }

  public addLink(name: string, link: oa.LinkObject): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.links === undefined) {
      this.rootDoc.components.links = {};
    }
    if (this.rootDoc.components.links[name] !== undefined) {
      throw new Error(`exist link "${name}"`);
    }
    this.rootDoc.components.links[name] = link;
    return this;
  }

  public addCallback(
    name: string,
    callback: oa.CallbackObject,
  ): oa.OpenApiBuilder {
    if (this.rootDoc.components === undefined) {
      this.rootDoc.components = {};
    }
    if (this.rootDoc.components.callbacks === undefined) {
      this.rootDoc.components.callbacks = {};
    }
    if (this.rootDoc.components.callbacks[name] !== undefined) {
      throw new Error(`exist callback "${name}"`);
    }
    this.rootDoc.components.callbacks[name] = callback;
    return this;
  }

  public addServer(server: oa.ServerObject): oa.OpenApiBuilder {
    if (this.rootDoc.servers === undefined) {
      this.rootDoc.servers = [];
    }
    this.rootDoc.servers.push(server);
    return this;
  }

  public addTag(tag: oa.TagObject): oa.OpenApiBuilder {
    if (this.rootDoc.tags === undefined) {
      this.rootDoc.tags = [];
    }
    this.rootDoc.tags.push(tag);
    return this;
  }

  public addExternalDocs(
    extDoc: oa.ExternalDocumentationObject,
  ): oa.OpenApiBuilder {
    this.rootDoc.externalDocs = extDoc;
    return this;
  }

  public addWebhook(
    webhook: string,
    webhookItem: oa.PathItemObject,
  ): oa.OpenApiBuilder {
    this.rootDoc.webhooks = {
      webhook: webhookItem,
    };
    return this;
  }
}
