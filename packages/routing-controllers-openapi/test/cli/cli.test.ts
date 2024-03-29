import { winPath } from '@liangskyli/utils';
import { execa } from 'execa';
import { URL } from 'node:url';
import { describe, expect, test } from 'vitest';

const cwd = new URL('../../', import.meta.url);
const cmd = 'node';
describe('CLI', () => {
  test('CLI test esm', async () => {
    const { stdout } = await execa(
      cmd,
      ['./bin/index.js', '-c', './test/cli/openapi.config.ts'],
      {
        cwd,
      },
    );
    await expect(winPath(stdout)).toMatchSnapshot();
  });

  test('CLI test cjs', async () => {
    const { stdout } = await execa(
      cmd,
      ['./bin/index.cjs', '-c', './test/cli/openapi.config.ts'],
      {
        cwd,
      },
    );
    await expect(winPath(stdout)).toMatchSnapshot();
  });
});
