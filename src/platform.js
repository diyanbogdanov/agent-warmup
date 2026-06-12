import nodeFs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { CONFIG_FILE_NAME } from './constants.js';

function pathForPlatform(platform) {
  return platform === 'win32' ? path.win32 : path.posix;
}

export function homeDirectory({ env = process.env, platform = process.platform } = {}) {
  if (platform === 'win32') {
    return env.USERPROFILE ?? os.homedir();
  }

  return env.HOME ?? os.homedir();
}

export function findExecutable(
  name,
  { env = process.env, platform = process.platform, fs = nodeFs } = {},
) {
  const platformPath = pathForPlatform(platform);
  const pathEntries = (env.PATH ?? '').split(platformPath.delimiter);
  const extensions =
    platform === 'win32' ? (env.PATHEXT ?? '.EXE;.CMD;.BAT;.COM').split(';') : [''];

  for (const pathEntry of pathEntries) {
    for (const extension of extensions) {
      const candidate = platformPath.normalize(platformPath.join(pathEntry, `${name}${extension}`));

      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

export function providerStateDir(provider, { env = process.env, platform = process.platform } = {}) {
  const platformPath = pathForPlatform(platform);
  const stateDirs = {
    claude: '.claude',
    codex: '.codex',
  };
  const stateDir = stateDirs[provider];

  if (stateDir === undefined) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  return platformPath.normalize(platformPath.join(homeDirectory({ env, platform }), stateDir));
}

export function configFilePath({ env = process.env, platform = process.platform } = {}) {
  const platformPath = pathForPlatform(platform);
  const baseDir =
    platform === 'win32'
      ? (env.APPDATA ?? platformPath.join(homeDirectory({ env, platform }), 'AppData', 'Roaming'))
      : (env.XDG_CONFIG_HOME ?? platformPath.join(homeDirectory({ env, platform }), '.config'));

  return platformPath.normalize(platformPath.join(baseDir, 'harness-reset', CONFIG_FILE_NAME));
}
