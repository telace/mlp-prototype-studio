#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const projectSlugInput = args.find((arg) => !arg.startsWith('--'));
const force = args.includes('--force-current-project');
const projectName = readOption('--name');

if (!projectSlugInput) usage();

const projectRoot = process.env.MLP_PROJECT_ROOT || resolve(process.env.USERPROFILE || process.env.HOME || '.', 'Documents', 'Codex', 'mlp-projects');
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectSlugInput)) {
  console.error('Project slug must contain only lowercase letters, numbers, and single hyphens.');
  process.exit(1);
}
const targetDir = resolve(projectRoot, projectSlugInput);
const templateDir = resolve(skillRoot, 'assets', 'framework-template');

if (!existsSync(templateDir)) throw new Error(`Template directory not found: ${templateDir}`);
if (existsSync(targetDir) && readdirSync(targetDir).length && !force) {
  console.error(`Refusing to scaffold into non-empty directory: ${targetDir}`);
  process.exit(2);
}

mkdirSync(targetDir, { recursive: true });
cpSync(templateDir, targetDir, {
  recursive: true,
  filter: (source) => !['node_modules', 'dist', '.npm-cache', '.playwright-cli', '.DS_Store', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'].includes(basename(source))
});

const folderName = basename(targetDir);
const slug = toSlug(folderName);
const displayName = projectName || humanize(folderName);
const createdAt = new Date().toISOString();
const packagePath = resolve(targetDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.name = `mlp-${slug}`;
writeJson(packagePath, packageJson);
updatePackageLock(slug);
writeProjectIdentity(displayName, slug);
writeDiscoveryDesign(createdAt.slice(0, 10));
writeDraftPrd(displayName, createdAt.slice(0, 10));
writePlatformMetadata(displayName, slug, createdAt);

const review = spawnSync(process.execPath, [resolve(targetDir, 'scripts', 'mlp-loop-review.mjs')], {
  cwd: targetDir,
  encoding: 'utf8'
});
if (review.stdout) process.stdout.write(review.stdout);
if (review.stderr) process.stderr.write(review.stderr);
if (review.status !== 0) {
  console.error(`Scaffold review failed. Project kept for diagnosis: ${targetDir}`);
  process.exit(review.status || 1);
}

console.log(`Created MLP project: ${targetDir}`);
console.log(`Project: ${displayName} (${slug})`);
console.log('Lifecycle: discovery');
console.log('Next: discuss and update docs/PRD.md before adding the first product page.');

function readOption(name) {
  const index = args.indexOf(name);
  if (index === -1) return '';
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    console.error(`${name} requires a value.`);
    process.exit(1);
  }
  return value.trim();
}

function toSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'mlp-project';
}

function humanize(value) {
  return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()).trim() || 'MLP Project';
}

function updatePackageLock(projectSlug) {
  const lockPath = resolve(targetDir, 'package-lock.json');
  if (!existsSync(lockPath)) return;
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  lock.name = `mlp-${projectSlug}`;
  if (lock.packages?.['']) lock.packages[''].name = `mlp-${projectSlug}`;
  writeJson(lockPath, lock);
}

function writeProjectIdentity(name, projectSlug) {
  const metaPath = resolve(targetDir, 'src', 'project', 'meta.js');
  const source = readFileSync(metaPath, 'utf8')
    .replace(/name:\s*'[^']*'/, `name: ${JSON.stringify(name)}`)
    .replace(/slug:\s*'[^']*'/, `slug: '${projectSlug}'`)
    .replace(/path:\s*'[^']*'/, `path: '/${projectSlug}/'`);
  writeFileSync(metaPath, source);
}

function writeDiscoveryDesign(date) {
  const designPath = resolve(targetDir, 'src', 'project', 'design.js');
  const source = readFileSync(designPath, 'utf8')
    .replace(/(prd:\s*\{[\s\S]*?status:)\s*'[^']*'/, "$1 'draft'")
    .replace(/(prd:\s*\{[\s\S]*?version:)\s*'[^']*'/, "$1 '0.1'")
    .replace(/(prd:\s*\{[\s\S]*?syncedAt:)\s*'[^']*'/, `$1 '${date}'`);
  writeFileSync(designPath, source);
}

function writeDraftPrd(name, date) {
  const prd = `# PRD：${name}\n\n状态：草稿\n版本：0.1\n更新时间：${date}\n\n## 1. 文档信息\n\n- 产品：${name}\n- 生命周期：需求讨论\n\n## 2. 背景与问题\n\n## 3. 产品目标\n\n## 4. 非目标\n\n## 5. 用户与场景\n\n## 6. 用户流程\n\n## 7. 功能范围\n\n## 8. 页面与状态\n\n需求讨论阶段暂未定义产品页面。\n\n## 9. 功能需求\n\n## 10. 业务规则\n\n## 11. 数据与集成\n\n## 12. 异常与边界\n\n## 13. 权限与合规\n\n## 14. 数据分析与成功指标\n\n## 15. 验收标准\n\n## 16. 开放问题与假设\n\n## 17. 变更记录\n\n- 0.1：创建中文需求讨论版PRD。\n`;
  writeFileSync(resolve(targetDir, 'docs', 'PRD.md'), prd);
}

function writePlatformMetadata(name, projectSlug, createdAt) {
  const mlpRoot = resolve(targetDir, '.mlp');
  mkdirSync(mlpRoot, { recursive: true });
  writeJson(resolve(mlpRoot, 'project.json'), {
    name,
    slug: projectSlug,
    path: `/${projectSlug}/`,
    lifecycle: 'discovery',
    createdAt,
    updatedAt: createdAt
  });
  writeJson(resolve(mlpRoot, 'versions.json'), { currentVersion: null, versions: [] });
  writeJson(resolve(mlpRoot, 'current.json'), { version: null, updatedAt: createdAt, distPath: null });
  writeJson(resolve(mlpRoot, 'access.json'), { mode: 'public', updatedAt: createdAt });
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function usage() {
  console.error('Usage: node scripts/scaffold-framework-project.mjs <project-slug> [--name "Project Name"] [--force-current-project]');
  process.exit(1);
}
