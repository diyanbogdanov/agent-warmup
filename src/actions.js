function singleLine(value) {
  return value.replace(/\s+/g, ' ').trim();
}

export function buildClaudeScheduleAction({ schedule, prompt }) {
  return {
    kind: 'spawn',
    command: 'claude',
    args: [`/schedule ${schedule} ${singleLine(prompt)}`],
  };
}

export function buildCodexAutomationAction({ schedule, prompt }) {
  const description = [
    'Create native Codex Automation "Agent Warmup".',
    `Run it ${schedule}.`,
    'Write $CODEX_HOME/automations/agent-warmup/automation.toml, or ~/.codex/automations/agent-warmup/automation.toml when CODEX_HOME is unset.',
    'Use this prompt:',
    prompt,
  ].join('\n');

  return {
    kind: 'codex-automation-file',
    id: 'agent-warmup',
    description,
  };
}

export function usageWarning(provider) {
  if (provider === 'claude') {
    return 'This will create a Claude Code Routine. Routine runs consume normal plan usage and can be rejected when routine or subscription limits are exhausted.';
  }

  if (provider === 'codex') {
    return 'This will create a Codex Automation. Automation runs consume normal Codex plan usage, and Codex usage can also count against weekly usage limits.';
  }

  return null;
}
