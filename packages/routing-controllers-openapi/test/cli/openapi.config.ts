import { defineConfig } from '../../lib/index.js';

export default defineConfig([
  {
    genOpenapiDir: './test/all-gen-dirs/gen-openapi-cli-1',
    controllers: ['./test/example/controller*/**/*.ts'],
    routePrefix: '/root',
    responseSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          description: '接口返回code码字段',
        },
        data: '#ResponseSchema',
        msg: {
          type: 'string',
          description: '接口返回信息字段',
        },
      },
      required: ['code', 'data'],
    },
  },
  {
    genOpenapiDir: './test/all-gen-dirs/gen-openapi-cli-2',
    controllers: [
      './test/example/controller1/**/*.ts',
      './test/example/controller2/**/*.ts',
      './test/example/controller3/**/*.ts',
      './test/example/controller4/**/*.ts',
    ],
    routePrefix: '/root',
    genOpenapiType: 'yaml',
  },
  {
    genOpenapiDir: './test/all-gen-dirs/gen-openapi-cli-3',
    controllers: ['./test/example/controller*/**/*.ts'],
    routePrefix: '/root',
    typeUniqueNames: false,
    responseSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          description: '接口返回code码字段',
        },
        data: '#ResponseSchema',
        msg: {
          type: 'string',
          description: '接口返回信息字段',
        },
      },
      required: ['code', 'data'],
    },
  },
]);
