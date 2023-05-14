import { describe, expect, test } from 'vitest';
import { genOpenapiDoc } from '../../src/gen/gen-openapi-doc';

describe('genOpenapiData', () => {
  test('genOpenapiData 1', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller1/**/*.ts'], {
      title: 'custom title',
      routePrefix: '/root',
      genOpenapiType: 'json',
    });
    await expect(specString1).toMatchFileSnapshot(
      './__test__snapshots__/openapi-1.json',
    );
    const specString2 = genOpenapiDoc(['./test/example/controller1/**/*.ts'], {
      title: 'custom title',
      routePrefix: '/root',
      genOpenapiType: 'yaml',
    });
    await expect(specString2).toMatchFileSnapshot(
      './__test__snapshots__/openapi-1.yaml',
    );
  });
  test('genOpenapiData 2', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller2/**/*.ts'], {
      genOpenapiType: 'json',
    });
    await expect(specString1).toMatchFileSnapshot(
      './__test__snapshots__/openapi-2.json',
    );
    const specString2 = genOpenapiDoc(['./test/example/controller2/**/*.ts'], {
      genOpenapiType: 'yaml',
    });
    await expect(specString2).toMatchFileSnapshot(
      './__test__snapshots__/openapi-2.yaml',
    );
  });
  test('genOpenapiData 3', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller3/**/*.ts'], {
      genOpenapiType: 'json',
      typeUniqueNames: false,
    });
    await expect(specString1).toMatchFileSnapshot(
      './__test__snapshots__/openapi-3.json',
    );
    const specString2 = genOpenapiDoc(['./test/example/controller3/**/*.ts'], {
      typeUniqueNames: false,
      genOpenapiType: 'yaml',
    });
    await expect(specString2).toMatchFileSnapshot(
      './__test__snapshots__/openapi-3.yaml',
    );
  });
  test('genOpenapiData 4', async () => {
    const specString1 = genOpenapiDoc(['./test/example/controller4/**/*.ts'], {
      genOpenapiType: 'json',
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
    });
    await expect(specString2).toMatchFileSnapshot(
      './__test__snapshots__/openapi-4.yaml',
    );
  });
});
