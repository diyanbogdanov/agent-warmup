import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';

import {
  configFilePath,
  findExecutable,
  providerStateDir,
} from '../src/platform.js';

test('findExecutable locates a Unix executable on PATH', () => {
  const fakeFs = {
    existsSync(candidate) {
      return candidate === path.posix.normalize('/usr/local/bin/claude');
    },
  };

  const result = findExecutable('claude', {
    env: { PATH: '/usr/bin:/usr/local/bin' },
    fs: fakeFs,
    platform: 'linux',
  });

  assert.equal(result, path.posix.normalize('/usr/local/bin/claude'));
});

test('findExecutable locates a Windows executable through PATHEXT', () => {
  const expectedPath = path.win32.normalize('C:\\Tools\\codex.CMD');
  const fakeFs = {
    existsSync(candidate) {
      return candidate === expectedPath;
    },
  };

  const result = findExecutable('codex', {
    env: {
      PATH: 'C:\\Windows;C:\\Tools',
      PATHEXT: '.EXE;.CMD',
    },
    fs: fakeFs,
    platform: 'win32',
  });

  assert.equal(result, expectedPath);
});

test('providerStateDir returns provider-specific state directories', () => {
  assert.equal(
    providerStateDir('claude', {
      env: { HOME: '/Users/alex' },
      platform: 'darwin',
    }),
    path.posix.normalize('/Users/alex/.claude'),
  );

  assert.equal(
    providerStateDir('codex', {
      env: { USERPROFILE: 'C:\\Users\\Alex' },
      platform: 'win32',
    }),
    path.win32.normalize('C:\\Users\\Alex\\.codex'),
  );
});

test('configFilePath returns the platform-specific config path', () => {
  assert.equal(
    configFilePath({
      env: { XDG_CONFIG_HOME: '/tmp/config' },
      platform: 'linux',
    }),
    path.posix.normalize('/tmp/config/harness-reset/config.json'),
  );

  assert.equal(
    configFilePath({
      env: { APPDATA: 'C:\\Users\\Alex\\AppData\\Roaming' },
      platform: 'win32',
    }),
    path.win32.normalize('C:\\Users\\Alex\\AppData\\Roaming\\harness-reset\\config.json'),
  );
});
