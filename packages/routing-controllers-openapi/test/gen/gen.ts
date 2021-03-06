import genOpenapiData from '../../src/index';

genOpenapiData({
  title: 'custom title',
  genOpenapiDir: './test/gen-openapi-dir',
  controllers: ['./test/controller/**/*.ts'],
  routePrefix: '/root',
  typeUniqueNames: false,
  //genOpenapiType: 'yaml',
  customOmitDecorators: [
    {
      package: 'typedi',
      name: 'Service',
    },
  ],
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
}).then();
