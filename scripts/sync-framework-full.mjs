#!/usr/bin/env node
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templateRoot = resolve(skillRoot, 'assets/framework-template');
const projectRoot = resolve(process.argv[2] || process.cwd());
const packagePath = resolve(projectRoot, 'package.json');
const srcRoot = resolve(projectRoot, 'src');

if (!existsSync(packagePath) || !existsSync(srcRoot)) {
  console.error(`Not an MLP project: ${projectRoot}`);
  process.exit(1);
}

function copyDir(sourceRel, targetRel = sourceRel) {
  const source = resolve(templateRoot, sourceRel);
  const target = resolve(projectRoot, targetRel);
  if (!existsSync(source)) return;
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

function copyFile(sourceRel, targetRel = sourceRel) {
  const source = resolve(templateRoot, sourceRel);
  const target = resolve(projectRoot, targetRel);
  if (!existsSync(source)) return;
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

copyDir('src/framework');
copyDir('src/app');
copyDir('src/docs');
copyDir('src/prototype-ui');
copyDir('src/project/test-cases');
copyFile('src/project/specs.js');
if (!existsSync(resolve(projectRoot, 'src/project/prompts.js'))) {
  copyFile('src/project/prompts.js');
}
if (!existsSync(resolve(projectRoot, 'src/project/design.js'))) {
  copyFile('src/project/design.js');
}
copyFile('src/styles.css');
copyFile('vite.config.js');
if (!existsSync(resolve(projectRoot, 'src/project/notes/local-edits.json'))) {
  copyFile('src/project/notes/local-edits.json');
}
copyFile('scripts/mlp-loop-review.mjs');
copyFile('scripts/mlp-annotation-acceptance.mjs');
copyFile('scripts/mlp-runtime-review.mjs');
copyFile('scripts/mlp-visual-review.mjs');
copyFile('scripts/mlp-skill-command.mjs');

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.scripts = packageJson.scripts || {};
packageJson.dependencies = packageJson.dependencies || {};
packageJson.dependencies.html2canvas = '^1.4.1';
packageJson.scripts.prebuild = 'node scripts/mlp-loop-review.mjs && node scripts/write-version.mjs';
packageJson.scripts['mlp:review'] = 'node scripts/mlp-loop-review.mjs';
delete packageJson.scripts['mlp:generate-docs'];
delete packageJson.scripts['mlp:prototype-acceptance'];
delete packageJson.scripts['mlp:docs-complete'];
packageJson.scripts['mlp:annotation-acceptance'] = 'node scripts/mlp-annotation-acceptance.mjs';
packageJson.scripts['mlp:fast-check'] = 'npm run build';
packageJson.scripts['mlp:runtime-review'] = 'node scripts/mlp-runtime-review.mjs';
packageJson.scripts['mlp:route-check'] = 'npm run mlp:fast-check && npm run mlp:runtime-review';
packageJson.scripts['mlp:visual-review'] = 'node scripts/mlp-visual-review.mjs';
packageJson.scripts['mlp:visual-snapshot'] = 'node scripts/mlp-visual-review.mjs --snapshot-only';
packageJson.scripts['mlp:acceptance'] = 'npm run mlp:route-check && npm run mlp:annotation-acceptance';
packageJson.scripts['mlp:visual-acceptance'] = 'npm run mlp:acceptance && npm run mlp:visual-review';
packageJson.scripts['mlp:framework-sync'] = 'node scripts/mlp-skill-command.mjs sync';
packageJson.scripts['mlp:framework-patch'] = 'node scripts/mlp-skill-command.mjs patch';
packageJson.scripts['mlp:migrate-full'] = 'node scripts/mlp-skill-command.mjs migrate';
packageJson.scripts['mlp:split-modules'] = 'node scripts/mlp-skill-command.mjs split';
packageJson.scripts['mlp:release'] = 'node scripts/mlp-skill-command.mjs release';
packageJson.scripts['mlp:versions'] = 'node scripts/mlp-skill-command.mjs versions';
packageJson.scripts['mlp:rollback'] = 'node scripts/mlp-skill-command.mjs rollback';
packageJson.scripts['mlp:access'] = 'node scripts/mlp-skill-command.mjs access';
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const screenshotDependencyPath = resolve(projectRoot, 'node_modules/html2canvas/package.json');
if (existsSync(resolve(projectRoot, 'node_modules')) && !existsSync(screenshotDependencyPath)) {
  console.log('Installing new framework dependency: html2canvas');
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const installResult = spawnSync(npmCommand, ['install', '--ignore-scripts'], { cwd: projectRoot, stdio: 'inherit', shell: false });
  if (installResult.status !== 0 || !existsSync(screenshotDependencyPath)) {
    console.error('Framework files were synced, but html2canvas installation failed. Run npm install before building.');
    process.exit(1);
  }
}

const projectDataPath = resolve(projectRoot, 'src/project/project-data.js');
if (existsSync(projectDataPath)) {
  let projectDataSource = readFileSync(projectDataPath, 'utf8');
  const requiredProjectExports = [
    "export * from './design.js';",
    "export * from './specs.js';",
    "export * from './prompts.js';"
  ];
  for (const line of requiredProjectExports) {
    if (!projectDataSource.includes(line)) {
      projectDataSource = projectDataSource.replace(
        "export * from './notes/index.js';",
        `export * from './notes/index.js';\n${line}`
      );
    }
  }
  writeFileSync(projectDataPath, projectDataSource);
}

console.log(`Synced complete MLP framework layer into ${projectRoot}`);
console.log('- src/framework/*');
console.log('- src/app/*');
console.log('- src/docs/*');
console.log('- src/prototype-ui/*');
console.log('- src/project/test-cases/*');
console.log('- src/project/design.js when missing');
console.log('- src/styles.css');
console.log('- vite.config.js');
console.log('- src/project/notes/local-edits.json when missing');
console.log('- scripts/mlp-loop-review.mjs');
console.log('- scripts/mlp-annotation-acceptance.mjs');
console.log('- scripts/mlp-runtime-review.mjs');
console.log('- scripts/mlp-visual-review.mjs');
console.log('- scripts/mlp-skill-command.mjs');
console.log('- package.json framework/check/acceptance scripts');
