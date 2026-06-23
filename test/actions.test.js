import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildClaudeScheduleAction,
  buildCodexAutomationAction,
  usageWarning,
} from '../src/actions.js';

test('buildClaudeScheduleAction creates a Claude schedule spawn action', () => {
  const prompt = 'Reply with exactly: ok Do not inspect files, do not run commands, do not modify anything, and do not use connectors or tools.';

  assert.deepEqual(buildClaudeScheduleAction({ schedule: 'daily at 09:00', prompt }), {
    kind: 'spawn',
    command: 'claude',
    args: [
      '/schedule daily at 09:00 Reply with exactly: ok Do not inspect files, do not run commands, do not modify anything, and do not use connectors or tools.',
    ],
  });
});

test('buildClaudeScheduleAction normalizes multiline prompt whitespace into one argument', () => {
  const action = buildClaudeScheduleAction({
    schedule: 'daily at 09:00',
    prompt: `
      Reply with exactly: ok

      Do not inspect files,
      do not run commands,
      and do not modify anything.
    `,
  });

  assert.deepEqual(action.args, [
    '/schedule daily at 09:00 Reply with exactly: ok Do not inspect files, do not run commands, and do not modify anything.',
  ]);
  assert.doesNotMatch(action.args[0], /\s{2,}/);
});

test('buildCodexAutomationAction describes the native Codex automation file action', () => {
  const prompt = 'Reply with exactly: ok';
  const action = buildCodexAutomationAction({ schedule: 'daily at 09:00', prompt });

  assert.equal(action.kind, 'codex-automation-file');
  assert.equal(action.id, 'agent-warmup');
  assert.match(action.description, /Create native Codex Automation "Agent Warmup"/);
  assert.match(action.description, /daily at 09:00/);
  assert.match(action.description, /automation\.toml/);
  assert.doesNotMatch(action.description, /Open a Codex thread/);
});

test('usageWarning describes Claude routine plan usage', () => {
  const warning = usageWarning('claude');

  assert.match(warning, /Claude Code Routine/);
  assert.match(warning, /consume normal plan usage/);
});

test('usageWarning describes Codex automation weekly usage', () => {
  const warning = usageWarning('codex');

  assert.match(warning, /Codex Automation/);
  assert.match(warning, /weekly usage/);
});
