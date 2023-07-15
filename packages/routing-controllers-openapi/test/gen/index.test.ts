import fs from 'fs-extra';
import path from 'path';
import { describe, expect, test, vi } from 'vitest';
import genOpenapiData from '../../src/gen/index';

describe('genOpenapiData', () => {
  test('genOpenapiData-1', async () => {
    await genOpenapiData({
      genOpenapiDir: './test/all-gen-dirs/gen-openapi-dir',
      controllers: ['./test/example/controller*/**/*.ts'],
      routePrefix: '/root',
      typeUniqueNames: false,
      customOmitDecorators: [
        {
          package: 'typedi',
          name: 'Service',
        },
      ],
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
    });
    const args = vi.mocked(fs.writeFileSync).mock.calls[0];
    expect(args[0] as string).toBe(
      path.join(
        __dirname,
        '../all-gen-dirs/gen-openapi-dir/openapi',
        'openapi-v3.json',
      ),
    );
    await expect(args[1]).toMatchFileSnapshot(
      './__test__snapshots__/openapi-v3.json',
    );

    expect((global as any).writePrettierFileArgs.prettierOptions).toEqual({
      parser: 'json',
    });
    expect((global as any).writePrettierFileArgs.successTip).toContain(
      'gen openapi success:',
    );
  });
  test('genOpenapiData-2', async () => {
    await genOpenapiData({
      genOpenapiDir: './test/all-gen-dirs/gen-openapi-dir',
      controllers: ['./test/example/controller*/**/*.ts'],
      routePrefix: '/root',
      typeUniqueNames: true,
      customOmitDecorators: [
        {
          package: 'typedi',
          name: 'Service',
        },
      ],
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
    });
    const args = vi.mocked(fs.writeFileSync).mock.calls[0];
    expect(args[0] as string).toBe(
      path.join(
        __dirname,
        '../all-gen-dirs/gen-openapi-dir/openapi',
        'openapi-v3.json',
      ),
    );

    expect((global as any).writePrettierFileArgs.prettierOptions).toEqual({
      parser: 'json',
    });
    expect((global as any).writePrettierFileArgs.successTip).toContain(
      'gen openapi success:',
    );
  });
  test('genOpenapiData genOpenapiDir not exist', () => {
    expect(() =>
      genOpenapiData({
        genOpenapiDir: './test/all-gen-dirs/gen-openapi-dir-error',
        controllers: ['./test/example/controller*/**/*.ts'],
        routePrefix: '/root',
        typeUniqueNames: false,
      }),
    ).rejects.toThrowError('genOpenapiDir not exits!');
  });
});
