import type { IGenOpenapiDataOpts } from '@liangskyli/routing-controllers-openapi';

const config: IGenOpenapiDataOpts = {
  genOpenapiDir: './test/gen-openapi-dir',
  controllers: ['./test/controller/**/*.ts'],
  routePrefix: '/root',
  // genOpenapiType: 'yaml',
  // 自定义统一 response 返回结构（可选）
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
};
export default config;
