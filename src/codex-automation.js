import nodeFs from 'node:fs';
import path from 'node:path';

import { providerStateDir } from './platform.js';

export const CODEX_WARMUP_AUTOMATION_ID = 'agent-warmup';

const CODEX_AUTOMATION_MODEL = 'gpt-5.3-codex-spark';
const CODEX_AUTOMATION_REASONING_EFFORT = 'minimal';
const DAILY_DAYS = 'MO,TU,WE,TH,FR,SA,SU';

function pathForPlatform(platform) {
  return platform === 'win32' ? path.win32 : path.posix;
}

function codexHomeDir({ env = process.env, platform = process.platform } = {}) {
  const platformPath = pathForPlatform(platform);
  return platformPath.normalize(env.CODEX_HOME || providerStateDir('codex', { env, platform }));
}

function automationDir({ env, platform }) {
  const platformPath = pathForPlatform(platform);
  return platformPath.join(
    codexHomeDir({ env, platform }),
    'automations',
    CODEX_WARMUP_AUTOMATION_ID,
  );
}

function automationFilePath({ env, platform }) {
  const platformPath = pathForPlatform(platform);
  return platformPath.join(automationDir({ env, platform }), 'automation.toml');
}

export function codexAutomationFilePath(options = {}) {
  return automationFilePath(options);
}

export function codexAutomationExists({
  env = process.env,
  fs = nodeFs,
  platform = process.platform,
} = {}) {
  return fs.existsSync(automationFilePath({ env, platform }));
}

export function dailyScheduleToRrule(schedule) {
  const match = /^daily at ([01]\d|2[0-3]):([0-5]\d)$/.exec(schedule);

  if (!match) {
    throw new Error(`Unsupported Codex automation schedule: ${schedule}`);
  }

  return `FREQ=WEEKLY;BYDAY=${DAILY_DAYS};BYHOUR=${Number(match[1])};BYMINUTE=${Number(match[2])}`;
}

function tomlString(value) {
  return JSON.stringify(String(value));
}

function readCreatedAt(filePath, { fs, fallback }) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  const match = /^created_at\s*=\s*(\d+)$/m.exec(fs.readFileSync(filePath, 'utf8'));
  return match ? Number(match[1]) : fallback;
}

export function writeCodexAutomation({
  cwd = process.cwd(),
  env = process.env,
  fs = nodeFs,
  now = Date.now,
  platform = process.platform,
  prompt,
  schedule,
} = {}) {
  const platformPath = pathForPlatform(platform);
  const dirPath = automationDir({ env, platform });
  const filePath = automationFilePath({ env, platform });
  const timestamp = now();
  const createdAt = readCreatedAt(filePath, { fs, fallback: timestamp });
  const rrule = dailyScheduleToRrule(schedule);
  const tempPath = platformPath.join(dirPath, `.automation.toml.${process.pid}.${timestamp}.tmp`);
  const contents = [
    'version = 1',
    `id = ${tomlString(CODEX_WARMUP_AUTOMATION_ID)}`,
    'kind = "cron"',
    'name = "Agent Warmup"',
    `prompt = ${tomlString(prompt)}`,
    'status = "ACTIVE"',
    `rrule = ${tomlString(rrule)}`,
    `model = ${tomlString(CODEX_AUTOMATION_MODEL)}`,
    `reasoning_effort = ${tomlString(CODEX_AUTOMATION_REASONING_EFFORT)}`,
    'execution_environment = "local"',
    `cwds = [${tomlString(cwd)}]`,
    `created_at = ${createdAt}`,
    `updated_at = ${timestamp}`,
    '',
  ].join('\n');

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(tempPath, contents, 'utf8');
  fs.renameSync(tempPath, filePath);

  return { filePath, id: CODEX_WARMUP_AUTOMATION_ID, rrule };
}

export function removeCodexAutomation({
  env = process.env,
  fs = nodeFs,
  platform = process.platform,
} = {}) {
  const dirPath = automationDir({ env, platform });
  const filePath = automationFilePath({ env, platform });
  const existed = fs.existsSync(filePath) || fs.existsSync(dirPath);

  fs.rmSync(dirPath, { recursive: true, force: true });
  return existed;
}
