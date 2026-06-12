import nodeFs from 'node:fs';
import path from 'node:path';

const IGNORED_NAMES = new Set(['node_modules', '.git', 'Cache', 'cache']);
const DAY_MS = 24 * 60 * 60 * 1000;

export function collectActivitySamples(
  rootDir,
  {
    fs = nodeFs,
    now = new Date(),
    maxDays = 30,
    maxEntries = 2000,
    maxDepth = 5,
  } = {},
) {
  const samples = [];
  const cutoff = new Date(now.getTime() - maxDays * DAY_MS);

  try {
    if (!fs.existsSync(rootDir)) {
      return [];
    }
  } catch {
    return [];
  }

  function visit(directory, depth) {
    if (samples.length >= maxEntries || depth > maxDepth) {
      return;
    }

    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (samples.length >= maxEntries || IGNORED_NAMES.has(entry.name)) {
        continue;
      }

      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        visit(entryPath, depth + 1);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      try {
        const { mtime } = fs.statSync(entryPath);

        if (mtime >= cutoff && mtime <= now) {
          samples.push(new Date(mtime.getTime()));
        }
      } catch {
        continue;
      }
    }
  }

  visit(rootDir, 0);
  return samples.sort((a, b) => a.getTime() - b.getTime());
}
