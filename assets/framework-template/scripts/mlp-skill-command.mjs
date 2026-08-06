#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const [command, ...args] = process.argv.slice(2);
const codexHome = process.env.CODEX_HOME || resolve(homedir(), '.codex');
const candidates = [
  process.env.MLP_SKILL_ROOT,
  resolve(codexHome, 'skills', 'mlp-prototype-studio'),
  resolve(codexHome, 'skills', 'mobile-lowfi-prototype')
].filter(Boolean);
const skillRoot = candidates.find((candidate) => existsSync(resolve(candidate, 'SKILL.md')));

if (!skillRoot) {
  console.error(`MLP skill not found. Checked: ${candidates.join(', ')}`);
  console.error('Set MLP_SKILL_ROOT to the installed MLP skill directory.');
  process.exit(1);
}

const commands = {
  sync: ['sync-framework-full.mjs'],
  patch: ['sync-framework-guards.mjs'],
  migrate: ['migrate-project-full.mjs'],
  split: ['split-project-modules.mjs'],
  release: ['mlp-version.mjs', 'release'],
  versions: ['mlp-version.mjs', 'list'],
  rollback: ['mlp-version.mjs', 'rollback'],
  access: ['mlp-access.mjs', 'show']
};

if (!commands[command]) {
  console.error(`Unknown MLP command: ${command || '(missing)'}`);
  console.error(`Available commands: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

const [script, ...prefixArgs] = commands[command];
const result = spawnSync(process.execPath, [resolve(skillRoot, 'scripts', script), ...prefixArgs, '.', ...args], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
