import { describe, expect, test } from 'vitest';
import { genOpenapiDoc } from '../../src/gen/gen-openapi-doc';

describe('genOpenapiDoc', () => {
  test('genOpenapiDoc-1', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller1/**/*.ts'], {
      title: 'custom title',
      routePrefix: '/root',
      genOpenapiType: 'json',
      typeUniqueNames: false,
    });
    await expect(specString1).toMatchFileSnapshot(
      './__test__snapshots__/openapi-1.json',
    );
    const specString2 = genOpenapiDoc(['./test/example/controller1/**/*.ts'], {
      title: 'custom title',
      routePrefix: '/root',
      genOpenapiType: 'yaml',
      typeUniqueNames: false,
    });
    await expect(specString2).toMatchFileSnapshot(
      './__test__snapshots__/openapi-1.yaml',
    );
  });
  test('genOpenapiDoc-2', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller2/**/*.ts'], {
      genOpenapiType: 'json',
      typeUniqueNames: false,
    });
    await expect(specString1).toMatchFileSnapshot(
      './__test__snapshots__/openapi-2.json',
    );
    const specString2 = genOpenapiDoc(['./test/example/controller2/**/*.ts'], {
      genOpenapiType: 'yaml',
      typeUniqueNames: false,
    });
    await expect(specString2).toMatchFileSnapshot(
      './__test__snapshots__/openapi-2.yaml',
    );
  });
  test('genOpenapiDoc-3', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller3/**/*.ts'], {
      genOpenapiType: 'json',
      typeUniqueNames: true,
      servers: [{ url: 'url' }],
    });
    await expect(specString1).toMatchFileSnapshot(
      './__test__snapshots__/openapi-3.json',
    );
    const specString2 = genOpenapiDoc(['./test/example/controller3/**/*.ts'], {
      typeUniqueNames: true,
      genOpenapiType: 'yaml',
      servers: [{ url: 'url' }],
    });
    await expect(specString2).toMatchFileSnapshot(
      './__test__snapshots__/openapi-3.yaml',
    );
  });
  test('genOpenapiDoc-4', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller4/**/*.ts'], {
      genOpenapiType: 'json',
      typeUniqueNames: false,
      responseSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            description: 'code info',
          },
          data: '#ResponseSchema',
          msg: {
            type: 'string',
            description: 'message',
          },
        },
        required: ['code', 'data'],
      },
    });
    await expect(specString1).toMatchFileSnapshot(
      './__test__snapshots__/openapi-4.json',
    );
    const specString2 = genOpenapiDoc(['./test/example/controller4/**/*.ts'], {
      responseSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            description: 'code info',
          },
          data: '#ResponseSchema',
          msg: {
            type: 'string',
            description: 'message',
          },
        },
        required: ['code', 'data'],
      },
      genOpenapiType: 'yaml',
      typeUniqueNames: false,
    });
    await expect(specString2).toMatchFileSnapshot(
      './__test__snapshots__/openapi-4.yaml',
    );
  });
  test('genOpenapiDoc-5 no ResponseSchema', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller3/**/*.ts'], {
      genOpenapiType: 'json',
      typeUniqueNames: false,
      responseSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            description: 'code info',
          },
          msg: {
            type: 'string',
            description: 'message',
          },
        },
        required: ['code', 'data'],
      },
    });
    await expect(specString1).toMatchFileSnapshot(
      './__test__snapshots__/openapi-5.json',
    );
  });
  test('genOpenapiDoc-6 same method multiple path', () => {
    expect(() =>
      genOpenapiDoc(['./test/example/error/multiple-path/**/*.ts'], {
        genOpenapiType: 'json',
        typeUniqueNames: false,
      }),
    ).toThrow('exist path "/v2/getQueryParams1-v2" have same method "get"');
  });
  test('genOpenapiDoc-7 multiple parameters', () => {
    expect(() =>
      genOpenapiDoc(
        ['./test/example/error/multiple-parameters/test1-controller.ts'],
        {
          genOpenapiType: 'json',
          typeUniqueNames: false,
        },
      ),
    ).toThrow('encountered multiple body parameters');

    expect(() =>
      genOpenapiDoc(
        ['./test/example/error/multiple-parameters/test2-controller.ts'],
        {
          genOpenapiType: 'json',
          typeUniqueNames: false,
        },
      ),
    ).toThrow('encountered multiple body parameter BodyParam1');
  });
});
