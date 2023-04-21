import * as spawn from 'cross-spawn';

const result = spawn.sync(
  'node',
  'bin/index.js -c ./test/gen/openapi.config.ts'.split(' '),
  {
    stdio: 'inherit',
  },
);

process.exit(result.status ?? undefined);
