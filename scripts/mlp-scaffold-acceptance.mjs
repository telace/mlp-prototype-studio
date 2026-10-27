#!/usr/bin/env node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const projectRoot = mkdtempSync(resolve(tmpdir(), 'mlp-scaffold-acceptance-'));
const projectSlug = 'scaffold-acceptance';
const target = resolve(projectRoot, projectSlug);

try {
  run(resolve(skillRoot, 'scripts/scaffold-framework-project.mjs'), [projectSlug, '--name', 'Scaffold Acceptance']);
  assert(exists('.mlp/project.json'), 'new project was not created below MLP_PROJECT_ROOT');
  expectScaffoldFailure(resolve(projectRoot, 'absolute-target'), 'Project slug must contain only lowercase letters');
  expectScaffoldFailure('../relative-target', 'Project slug must contain only lowercase letters');
  const project = readJson('.mlp/project.json');
  assert(project.lifecycle === 'discovery', 'new project lifecycle is not discovery');
  assert(project.name === 'Scaffold Acceptance', 'project name was not initialized');
  assert(!exists('pnpm-lock.yaml') && !exists('pnpm-workspace.yaml'), 'pnpm files leaked into npm project');
  const prd = readFileSync(resolve(target, 'docs/PRD.md'), 'utf8');
  assert(prd.includes('状态：草稿'), 'new PRD is not a Chinese draft');
  assert(prd.includes('## 17. 变更记录'), 'new PRD does not use the Chinese structure');
  const packageJson = readJson('package.json');
  assert(packageJson.scripts.prebuild === 'node scripts/mlp-loop-review.mjs && node scripts/write-version.mjs', 'build does not enforce prebuild review');
  assert(packageJson.scripts['mlp:fast-check'] === 'npm run build', 'fast check must use the guarded build');
  const prdPath = resolve(target, 'docs/PRD.md');
  writeFileSync(prdPath, prd.replace('状态：草稿', 'Status: draft'));
  expectFailure('PRD必须使用中文状态：草稿或已同步');
  expectFailure('PRD不得使用英文元数据标签');
  writeFileSync(prdPath, prd.replace('## 2. 背景与问题', '## 2. Background And Problem'));
  expectFailure('PRD中文章节缺失: 背景与问题');
  expectFailure('PRD不得保留英文标准章节');
  writeFileSync(prdPath, prd);

  const directoryPath = resolve(target, 'src/project/directory.js');
  const directoryHelpers = readFileSync(directoryPath, 'utf8')
    .replace(/export const pageDirectory = \[\];/, '')
    .replace(/export const uiDesignChecklist = \[\];/, '');
  writeFileSync(directoryPath, `export const pageDirectory = [{ id: 'invalid', number: 1, label: 'Invalid', group: 'Flow', level: 'primary', status: 'draft' }];\nexport const uiDesignChecklist = [];\n`);
  expectFailure('discovery lifecycle must not contain product pages');

  writeFileSync(directoryPath, 'export const pageDirectory = [];\nexport const uiDesignChecklist = [];\n');
  const metaPath = resolve(target, '.mlp/project.json');
  writeFileSync(metaPath, JSON.stringify({ ...project, lifecycle: 'prototype' }));
  expectFailure('PRD must be synced before prototype work');

  // Exercise a real registered page without a design schema or component registry.
  const designPath = resolve(target, 'src/project/design.js');
  writeFileSync(designPath, "export const designContract = { prd: { path: 'docs/PRD.md', status: 'synced' } };\n");
  writeFileSync(prdPath, prd.replace('状态：草稿', '状态：已同步'));
  writeFileSync(directoryPath, "export const pageDirectory = [{ id: 'custom', number: 1, label: '自定义设计', group: '探索', level: 'primary', status: 'draft' }];\nexport const uiDesignChecklist = [{ pageId: 'custom', state: '默认态' }];\n");
  writeFileSync(directoryPath, readFileSync(directoryPath, 'utf8') + directoryHelpers);
  mkdirSync(resolve(target, 'src/pages/custom'), { recursive: true });
  const customPagePath = resolve(target, 'src/pages/custom/CustomPage.jsx');
  writeFileSync(customPagePath, `import { useEffect, useState } from 'react';
import { bindInteraction } from '../../framework/interaction.js';
function ProjectButton() { return <button className="project-button">自定义按钮</button>; }
export function CustomPage({ setActiveInteraction }) {
  const [phase, setPhase] = useState('loading');
  useEffect(() => {
    const timer = setTimeout(() => setPhase('done'), 1000);
    return () => clearTimeout(timer);
  }, []);
  return <div className="app-page custom-page">
    <h1>自定义视觉</h1>
    <div {...bindInteraction('custom-action', setActiveInteraction)}><ProjectButton /></div>
    <input aria-label="输入内容" />
    <div className="prototype-modal">{phase}</div>
    <div className="custom-overflow">诊断样例：超出可视区的横向内容</div>
    <video onEnded={() => setPhase('done')} />
  </div>;
}
`);
  writeFileSync(resolve(target, 'src/project/routes.jsx'), "import { CustomPage } from '../pages/custom/CustomPage.jsx';\nexport function renderPhoneScreen(props) { return props.page === 'custom' ? <CustomPage {...props} /> : null; }\n");
  const pagesCssPath = resolve(target, 'src/pages/styles/pages.css');
  const pagesCss = readFileSync(pagesCssPath, 'utf8');
  writeFileSync(pagesCssPath, pagesCss + '\n' + [
    '.custom-page { background: linear-gradient(30deg, #fff, #b0ded7); color: #143926; padding: 19px; gap: 13px; }',
    '.custom-page h1 { font-size: 21px; line-height: 29px; }',
    '.project-button { height: 49px; padding: 11px 19px; border-radius: 15px; background: #254932; color: #fff; font-size: 17px; }',
    '.custom-page .mlp-button { background: #194929; border: 2px solid #eee; }',
    '.prototype-modal { padding: 15px; box-shadow: 0 2px 13px #ddd; }',
    '.custom-overflow { width: 420px; }',
    ...Array.from({ length: 81 }, (_, index) => '.custom-' + index + ' { display: block; padding: 13px; border-radius: 15px; color: #194929; }')
  ].join('\n'));
  expectPass('custom design without closed component, CSS, number or automatic-transition restrictions');

  const localEditsPath = resolve(target, 'src/project/notes/local-edits.json');
  const localEdits = readJson('src/project/notes/local-edits.json');
  writeFileSync(localEditsPath, `${JSON.stringify({ ...localEdits, elementDeletions: { invalid: { default: { deleted: { elementId: 'removed-module', status: 'applied', sourceRefs: ['removed-route'] } } } } }, null, 2)}\n`);
  const deletionPagePath = resolve(target, 'src/pages/custom/DeletionResidue.jsx');
  writeFileSync(deletionPagePath, `export function DeletionResidue() { return <div data-element-id="removed-module">removed-route</div>; }\n`);
  expectFailure('保留已删除元素引用 removed-module');
  expectFailure('保留已删除元素引用 removed-route');
  rmSync(deletionPagePath);
  writeFileSync(localEditsPath, `${JSON.stringify(localEdits, null, 2)}\n`);

  const supportPagesPath = resolve(target, 'src/framework/supportPages.js');
  const supportPages = readFileSync(supportPagesPath, 'utf8');
  writeFileSync(supportPagesPath, supportPages.replace("{ id: 'prompts', number: 'S5', label: '提示词', group: '提示词', level: 'docs', status: 'draft' },", ''));
  expectFailure('页面目录缺少固定提示词入口');
  writeFileSync(supportPagesPath, supportPages.replace("status: 'draft' },\n  { id: 'uiSpec'", "status: 'draft', placement: 'hidden' },\n  { id: 'uiSpec'"));
  expectFailure('固定UI设计清单或提示词入口不得隐藏或移出页面目录');
  writeFileSync(supportPagesPath, supportPages);

  expectPass('framework integrity restored');
  if (process.argv.includes('--runtime')) {
    const dependencies = resolve(skillRoot, 'assets/framework-template/node_modules');
    assert(existsSync(dependencies), '--runtime requires installed template dependencies');
    symlinkSync(dependencies, resolve(target, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
    for (const [script, args] of [
      ['scripts/write-version.mjs', []],
      ['node_modules/vite/bin/vite.js', ['build']],
      ['scripts/mlp-runtime-review.mjs', []]
    ]) {
      const result = spawnSync(process.execPath, [resolve(target, script), ...args], {
        cwd: target, encoding: 'utf8',
        env: { ...process.env, MLP_RUNTIME_URL: '', MLP_RUNTIME_PORT: '15375', MLP_CHROME_DEBUG_PORT: '19335' }
      });
      assert(result.status === 0, script + '\n' + result.stdout + '\n' + result.stderr);
      if (script.endsWith('mlp-runtime-review.mjs')) {
        assert(result.stdout.includes('PASS 自定义设计'), 'custom product route was not exercised');
        assert(result.stderr.includes('DOM layout:'), 'layout diagnostics were not exercised');
        process.stdout.write(result.stdout);
        console.log('PASS layout diagnostics remain advisory');
      }
    }
  }
  console.log('MLP scaffold acceptance: PASS (open design accepted; PRD, support entries and deletion protections retained)');
} finally {
  rmSync(projectRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}

function run(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: skillRoot,
    encoding: 'utf8',
    env: { ...process.env, MLP_PROJECT_ROOT: projectRoot }
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Command failed: ${script}`);
  return result;
}

function expectScaffoldFailure(input, message) {
  const result = spawnSync(process.execPath, [resolve(skillRoot, 'scripts/scaffold-framework-project.mjs'), input], {
    cwd: skillRoot,
    encoding: 'utf8',
    env: { ...process.env, MLP_PROJECT_ROOT: projectRoot }
  });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  assert(result.status !== 0, `scaffold unexpectedly accepted path input: ${input}`);
  assert(output.includes(message), `scaffold did not reject path input: ${input}`);
}

function expectFailure(message) {
  const result = spawnSync(process.execPath, [resolve(target, 'scripts/mlp-loop-review.mjs')], { cwd: target, encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  assert(result.status !== 0, `review unexpectedly passed; expected ${message}`);
  assert(output.includes(message), `review did not report: ${message}`);
}

function expectPass(context) {
  const result = spawnSync(process.execPath, [resolve(target, 'scripts/mlp-loop-review.mjs')], { cwd: target, encoding: 'utf8' });
  assert(result.status === 0, context + '\n' + result.stdout + '\n' + result.stderr);
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(target, path), 'utf8'));
}

function exists(path) {
  try {
    readFileSync(resolve(target, path));
    return true;
  } catch {
    return false;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
