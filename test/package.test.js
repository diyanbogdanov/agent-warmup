import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

test('package publishes only src and points bin at an executable CLI stub', async () => {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

  assert.deepEqual(packageJson.files, ['src']);

  const binTarget = packageJson.bin?.['harness-reset'];
  assert.equal(typeof binTarget, 'string');

  const binPath = path.join(process.cwd(), binTarget);
  await access(binPath);

  const binContents = await readFile(binPath, 'utf8');
  assert.equal(binContents.split('\n')[0], '#!/usr/bin/env node');
});
