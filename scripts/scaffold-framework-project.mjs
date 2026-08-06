#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const targetInput = args.find((arg) => !arg.startsWith('--'));
const force = args.includes('--force-current-project');
const templateName = args.includes('--full-current-template') ? 'current-workbench-template' : 'framework-template';

if (!targetInput) {
  console.error('Usage: scaffold-framework-project.mjs <project-slug-or-target-directory> [--force-current-project] [--full-current-template]');
  process.exit(1);
}

const projectRoot = process.env.MLP_PROJECT_ROOT || resolve(process.env.USERPROFILE || process.env.HOME || '.', 'Documents', 'Codex', 'mlp-projects');
const targetDir = isAbsolute(targetInput)
  ? resolve(targetInput)
  : targetInput.includes('/') || targetInput.includes('\\')
    ? resolve(process.cwd(), targetInput)
    : resolve(projectRoot, targetInput);
const templateDir = resolve(skillRoot, 'assets', templateName);

if (!existsSync(templateDir)) throw new Error(`Template directory not found: ${templateDir}`);
if (existsSync(targetDir) && readdirSync(targetDir).length && !force) {
  console.error(`Refusing to scaffold into non-empty directory: ${targetDir}`);
  process.exit(2);
}

mkdirSync(targetDir, { recursive: true });
cpSync(templateDir, targetDir, {
  recursive: true,
  filter: (source) => !['node_modules', 'dist', '.npm-cache', '.playwright-cli', '.DS_Store'].includes(basename(source))
});

const slug = basename(targetDir).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'mlp-project';
const packagePath = resolve(targetDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.name = `mlp-${slug}`;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

console.log(`Created MLP project from ${templateName}: ${targetDir}`);
console.log(`Project package name: ${packageJson.name}`);
