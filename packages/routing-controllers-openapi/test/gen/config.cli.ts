import type { IGenOpenapiDataOpts } from '@liangskyli/routing-controllers-openapi';

const config: IGenOpenapiDataOpts = {
  genOpenapiDir: './test/gen-openapi-dir',
  controllers: ['./test/controller/**/*.ts'],
  routePrefix: '/root',
};
export default config;
