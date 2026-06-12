#!/usr/bin/env node

const USAGE = 'Usage: harness-reset <detect|plan|setup|status> [--provider claude|codex] [--time HH:MM] [--dry-run] [--yes]';

export async function runCli() {
  console.log(USAGE);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await runCli();
}
