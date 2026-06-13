# harness-reset

NPX-friendly setup CLI for native Claude Code Routines and Codex Automations.

## What it does

- Detects `claude` and `codex`.
- Looks at local state file modification times without reading prompt or response contents.
- Suggests a daily warmup time, defaulting to 30 minutes before usual first activity.
- Creates a Claude Code Routine through the native `/schedule` flow.
- Provides native Codex Automation instructions when direct creation is unavailable from a plain terminal.

## What it does not do

- Does not run its own scheduler.
- Does not create cron, launchd, systemd, Windows Task Scheduler, GitHub Actions, or Cloudflare Workers jobs.
- Does not store provider credentials.
- Does not guarantee a reset window starts or improves; it creates native scheduled warmup runs only.

## Usage

```bash
npx harness-reset detect
npx harness-reset plan
npx harness-reset setup --provider claude --dry-run
npx harness-reset setup --provider codex --time 09:00 --dry-run
```

To create a Claude Code Routine:

```bash
npx harness-reset setup --provider claude --time 09:00
```

Type `create` when prompted to continue.

Claude Code Routines consume normal Claude plan usage. Codex Automations consume normal Codex usage and can affect weekly usage limits.

## Metadata paths

- macOS/Linux: `~/.config/harness-reset/config.json`
- Windows: `%APPDATA%\harness-reset\config.json`
