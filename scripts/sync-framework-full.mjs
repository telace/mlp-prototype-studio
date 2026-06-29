#!/usr/bin/env node
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
if (!existsSync(resolve(projectRoot, 'src/project/specs.js'))) {
  copyFile('src/project/specs.js');
}
if (!existsSync(resolve(projectRoot, 'src/project/prompts.js'))) {
  copyFile('src/project/prompts.js');
}
copyFile('src/styles.css');
copyFile('vite.config.js');
if (!existsSync(resolve(projectRoot, 'src/project/notes/local-edits.json'))) {
  copyFile('src/project/notes/local-edits.json');
}
copyFile('scripts/mlp-loop-review.mjs');
copyFile('scripts/mlp-generate-docs.mjs');
copyFile('scripts/mlp-prototype-acceptance.mjs');
copyFile('scripts/mlp-runtime-review.mjs');
copyFile('scripts/mlp-visual-review.mjs');

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts['mlp:review'] = 'node scripts/mlp-loop-review.mjs';
packageJson.scripts['mlp:generate-docs'] = 'node scripts/mlp-generate-docs.mjs';
packageJson.scripts['mlp:prototype-acceptance'] = 'node scripts/mlp-prototype-acceptance.mjs';
packageJson.scripts['mlp:docs-complete'] = 'npm run mlp:generate-docs && npm run mlp:prototype-acceptance && npm run mlp:route-check';
packageJson.scripts['mlp:fast-check'] = 'npm run mlp:review && npm run build';
packageJson.scripts['mlp:runtime-review'] = 'node scripts/mlp-runtime-review.mjs';
packageJson.scripts['mlp:route-check'] = 'npm run mlp:fast-check && npm run mlp:runtime-review';
packageJson.scripts['mlp:visual-review'] = 'node scripts/mlp-visual-review.mjs';
packageJson.scripts['mlp:visual-snapshot'] = 'node scripts/mlp-visual-review.mjs --snapshot-only';
packageJson.scripts['mlp:acceptance'] = 'npm run mlp:route-check && npm run mlp:prototype-acceptance';
packageJson.scripts['mlp:visual-acceptance'] = 'npm run mlp:acceptance && npm run mlp:visual-review';
packageJson.scripts['mlp:framework-sync'] = `node ${resolve(skillRoot, 'scripts/sync-framework-full.mjs')} .`;
packageJson.scripts['mlp:framework-patch'] = `node ${resolve(skillRoot, 'scripts/sync-framework-guards.mjs')} .`;
packageJson.scripts['mlp:migrate-full'] = `node ${resolve(skillRoot, 'scripts/migrate-project-full.mjs')} .`;
packageJson.scripts['mlp:split-modules'] = `node ${resolve(skillRoot, 'scripts/split-project-modules.mjs')} .`;
packageJson.scripts['mlp:release'] = `node ${resolve(skillRoot, 'scripts/mlp-version.mjs')} release .`;
packageJson.scripts['mlp:versions'] = `node ${resolve(skillRoot, 'scripts/mlp-version.mjs')} list .`;
packageJson.scripts['mlp:rollback'] = `node ${resolve(skillRoot, 'scripts/mlp-version.mjs')} rollback .`;
packageJson.scripts['mlp:access'] = `node ${resolve(skillRoot, 'scripts/mlp-access.mjs')} show .`;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const projectDataPath = resolve(projectRoot, 'src/project/project-data.js');
if (existsSync(projectDataPath)) {
  let projectDataSource = readFileSync(projectDataPath, 'utf8');
  const requiredProjectExports = [
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
console.log('- src/styles.css');
console.log('- vite.config.js');
console.log('- src/project/notes/local-edits.json when missing');
console.log('- scripts/mlp-loop-review.mjs');
console.log('- scripts/mlp-generate-docs.mjs');
console.log('- scripts/mlp-prototype-acceptance.mjs');
console.log('- scripts/mlp-runtime-review.mjs');
console.log('- scripts/mlp-visual-review.mjs');
console.log('- package.json framework/check/acceptance scripts');
