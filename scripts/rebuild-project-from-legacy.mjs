#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templateRoot = resolve(skillRoot, 'assets/framework-template');
const defaultProjectRoot = resolve(process.env.MLP_PROJECT_ROOT || `${process.env.HOME}/Documents/Codex/mlp-projects`);

const args = process.argv.slice(2);
const options = {
  force: false,
  dryRun: false,
  skipVerify: false,
  keepFailed: false
};
let legacyArg = '';
let targetArg = '';

for (const arg of args) {
  if (arg === '--force') options.force = true;
  else if (arg === '--dry-run') options.dryRun = true;
  else if (arg === '--skip-verify') options.skipVerify = true;
  else if (arg === '--keep-failed') options.keepFailed = true;
  else if (!legacyArg) legacyArg = arg;
  else if (!targetArg) targetArg = arg;
  else {
    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
}

if (!legacyArg || !targetArg) {
  console.error('Usage: rebuild-project-from-legacy.mjs <legacy-project-slug-or-path> <target-project-slug-or-path> [--force] [--dry-run] [--skip-verify] [--keep-failed]');
  process.exit(1);
}

const resolveProject = (value) => {
  if (value.startsWith('/') || value === '.' || value.startsWith('./') || value.startsWith('../')) return resolve(value);
  return resolve(defaultProjectRoot, value);
};

const legacyRoot = resolveProject(legacyArg);
const targetRoot = resolveProject(targetArg);
const targetSlug = basename(targetRoot);
const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const reportDir = resolve(targetRoot, '.mlp/rebuild/reports');
const reportPath = resolve(reportDir, `${timestamp}.md`);
const existingBackupRoot = resolve(dirname(targetRoot), `${basename(targetRoot)}.backup.rebuild-${timestamp}`);

const report = {
  status: 'running',
  legacyRoot,
  targetRoot,
  stages: [],
  failures: []
};

function stage(name, status, detail = '') {
  report.stages.push({ name, status, detail, at: new Date().toISOString() });
  const suffix = detail ? `: ${detail}` : '';
  console.log(`${status.toUpperCase()} ${name}${suffix}`);
}

function saveReport() {
  mkdirSync(reportDir, { recursive: true });
  const lines = [
    '# MLP Rebuild From Legacy Report',
    '',
    `- Status: ${report.status}`,
    `- Legacy project: ${legacyRoot}`,
    `- Target project: ${targetRoot}`,
    `- Started: ${timestamp}`,
    '',
    '## Stages',
    ...report.stages.map((item) => `- ${item.status.toUpperCase()} ${item.name}${item.detail ? `: ${item.detail}` : ''}`),
    '',
    '## Failures',
    ...(report.failures.length ? report.failures.map((item) => `- ${item}`) : ['- None'])
  ];
  writeFileSync(reportPath, `${lines.join('\n')}\n`);
}

function fail(message) {
  report.status = 'failed';
  report.failures.push(message);
  console.error(message);
  if (existsSync(targetRoot) && !options.keepFailed) {
    rmSync(targetRoot, { recursive: true, force: true });
    if (existsSync(existingBackupRoot)) {
      cpSync(existingBackupRoot, targetRoot, { recursive: true });
      stage('rollback', 'done', 'restored previous target project');
    } else {
      stage('rollback', 'done', 'removed failed rebuilt target');
    }
  }
  if (existsSync(reportDir) || options.keepFailed || existsSync(targetRoot)) {
    saveReport();
  }
  process.exit(1);
}

function run(command, commandArgs, cwd = targetRoot, env = {}) {
  console.log(`\n$ ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    shell: false,
    env: { ...process.env, ...env }
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) fail(`${command} ${commandArgs.join(' ')} failed with exit code ${result.status}`);
  return result;
}

function readLegacySource() {
  const candidates = [
    resolve(legacyRoot, 'src/legacy/LegacyApp.jsx'),
    resolve(legacyRoot, 'src/main.jsx'),
    resolve(legacyRoot, 'src/app/App.jsx')
  ];
  const path = candidates.find((candidate) => existsSync(candidate));
  if (!path) fail(`Cannot find legacy React source in ${legacyRoot}`);
  return { path, source: readFileSync(path, 'utf8') };
}

function readLegacyCss() {
  const candidates = [
    resolve(legacyRoot, 'src/legacy/legacy.css'),
    resolve(legacyRoot, 'src/pages/styles/pages.css'),
    resolve(legacyRoot, 'src/styles.css')
  ];
  const path = candidates.find((candidate) => existsSync(candidate));
  return path ? readFileSync(path, 'utf8') : '';
}

function copyFrameworkTemplate() {
  if (!existsSync(templateRoot)) fail(`Framework template not found: ${templateRoot}`);
  if (existsSync(targetRoot)) {
    if (!options.force) fail(`Target already exists: ${targetRoot}. Use --force to replace it after backup.`);
    cpSync(targetRoot, existingBackupRoot, {
      recursive: true,
      filter: (sourcePath) => !['node_modules', 'dist', '.npm-cache', '.playwright-cli'].includes(basename(sourcePath))
    });
    rmSync(targetRoot, { recursive: true, force: true });
    stage('backup existing target', 'done', existingBackupRoot);
  }
  cpSync(templateRoot, targetRoot, {
    recursive: true,
    filter: (sourcePath) => !['node_modules', 'dist', '.npm-cache', '.playwright-cli'].includes(basename(sourcePath))
  });
  stage('copy latest framework', 'done', 'assets/framework-template');

  const packagePath = resolve(targetRoot, 'package.json');
  if (existsSync(packagePath)) {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    packageJson.name = `${targetSlug}-prototype`;
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['mlp:rebuild-from-legacy'] = `node ${resolve(skillRoot, 'scripts/rebuild-project-from-legacy.mjs')} ${legacyRoot} . --force`;
    writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  }
}

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) fail(`Missing marker: ${start}`);
  const endIndex = end ? source.indexOf(end, startIndex) : source.length;
  if (end && endIndex < 0) fail(`Missing end marker: ${end}`);
  return `${source.slice(startIndex, endIndex).trim()}\n`;
}

function write(relativePath, content) {
  const target = resolve(targetRoot, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function exportConstAndFunctions(block) {
  return block.replace(/^(const|function) /gm, 'export $1 ');
}

function rewriteProjectMeta(block) {
  return block
    .replace(/slug:\s*['"][^'"]+['"]/, `slug: '${targetSlug}'`)
    .replace(/path:\s*['"][^'"]+['"]/, `path: '/${targetSlug}/'`);
}

function stripTemplateSamplePages() {
  for (const stale of [
    'src/pages/sample',
    'src/pages/secondary',
    'src/pages/components',
    'src/pages/shared',
    'src/docs/PromptDocsPage.jsx'
  ]) {
    rmSync(resolve(targetRoot, stale), { recursive: true, force: true });
  }
}

function filterProjectCss(css) {
  const allowedNeedles = [
    'replica', 'upload', 'analysis', 'video', 'flow-', 'link-', 'crop-', 'model-',
    'replacement', 'generate', 'work-detail', 'prompt-doc', 'style-map', 'bottom-action',
    'bottom-cta', 'ghost-cta', 'common-generating', 'section-title', 'target-', 'detected-',
    'copy-', 'template-cover', 'works-', 'work-item', 'empty-state', 'workflow-card',
    'prompt-row', 'prompt-input', 'prompt-placeholder', 'video-placeholder', 'generated-video'
  ];
  const blockedNeedles = [
    'MLP FRAMEWORK', 'MLP STRICT', '.app-shell', '.workspace', '.project-card', '.left-rail',
    '.page-directory', '.spec-panel', '.phone-stage', '.prototype-state-switch', '.phone {',
    '.statusbar', '.screen,', 'body,', ':root', '--workspace-', '.theme-card',
    '.interaction-connector', '.update-banner', '.ui-checklist', '.ui-spec'
  ];
  const blocks = css.split(/(?=\n(?:[.#][\w-]|@media|@keyframes))/);
  return blocks
    .filter((block) => {
      if (!allowedNeedles.some((needle) => block.includes(needle))) return false;
      return !blockedNeedles.some((needle) => block.includes(needle));
    })
    .join('\n\n')
    .replace(/\bmodal-layer\b/g, 'mlp-legacy-modal-layer')
    .replace(/\bmodal-backdrop\b/g, 'mlp-legacy-modal-backdrop')
    .replace(/\bmodal-actions\b/g, 'mlp-legacy-modal-actions')
    .trim();
}

function rebuildVideoReplication(source, css) {
  stage('recognizer', 'done', 'video-replication single-file prototype');
  stripTemplateSamplePages();

  const projectBlock = rewriteProjectMeta(between(source, 'const project = {', 'const pageDirectory = ['));
  const pageDirectoryBlock = between(source, 'const pageDirectory = [', 'const directoryStatusCopy = {');
  const directoryCopyBlock = between(source, 'const directoryStatusCopy = {', 'const themeCopy = {');
  const themeHelpersBlock = between(source, 'const themeCopy = {', 'const videoStyleConfigs = [');
  const videoStyleBlock = between(source, 'const videoStyleConfigs = [', 'const pageStates = {');
  const pageStatesBlock = between(source, 'const pageStates = {', 'const replicaPageIds = [');
  const constantsBlock = between(source, 'const replicaPageIds = [', 'const uiDesignChecklist = [');
  const checklistBlock = between(source, 'const uiDesignChecklist = [', 'const featureLogic = {');
  const featureLogicBlock = between(source, 'const featureLogic = {', 'const pageCopy = {');
  const pageCopyBlock = between(source, 'const pageCopy = {', 'const pageInteractions = {');
  const interactionsBlock = between(source, 'const uploadInteractions = [', 'const uiColorSpec = [');
  const specsBlock = between(source, 'const uiColorSpec = [', 'const makeJsonVideoPrompt');
  const promptDataBlock = between(source, 'const makeJsonVideoPrompt', 'function getVisibleInteractionSource');
  const appBlock = between(source, 'function App()', 'function ProjectSettingsRail');
  const shellHelperBlock = between(source, 'function getPageShellConfig', 'function renderPhoneScreen');
  const routeRenderBlock = between(source, 'function renderPhoneScreen', 'function PhoneFrame');
  const phoneBlock = between(source, 'function PhoneFrame', 'function ReplicaScreen');
  const replicaBlock = between(source, 'function ReplicaScreen', 'function UIDesignChecklistPage');
  const checklistPageBlock = between(source, 'function UIDesignChecklistPage', 'function PromptDocsPage');
  const promptsBlock = between(source, 'function PromptDocsPage', 'function StyleAppendixPage');
  const appendixBlock = between(source, 'function StyleAppendixPage', 'function SpecPanel');

  const routeHelpers = `
export function parsePrototypeHash() {
  if (typeof window === 'undefined') return { page: pageDirectory[0]?.id || 'upload', stateId: null };
  const [pageCandidate, stateCandidate] = window.location.hash.replace(/^#\\/?/, '').split('/').filter(Boolean);
  const fallbackPage = pageDirectory.find((item) => item.level !== 'docs')?.id || pageDirectory[0]?.id || 'upload';
  const page = pageDirectory.some((item) => item.id === pageCandidate) ? pageCandidate : fallbackPage;
  const states = pageStates[page] || [{ id: 'default' }];
  const stateId = states.some((state) => state.id === stateCandidate) ? stateCandidate : states[0]?.id || 'default';
  return { page, stateId };
}

export function getPrototypeHash(page, stateId) {
  const normalizedState = stateId && stateId !== 'default' ? \`/\${stateId}\` : '';
  return \`#/\${page}\${normalizedState}\`;
}
`;

  write('src/project/meta.js', exportConstAndFunctions(`${projectBlock}\n${themeHelpersBlock}`));
  write('src/project/states.js', exportConstAndFunctions(`${videoStyleBlock}\n${pageStatesBlock}`));
  writeFileSync(
    resolve(targetRoot, 'src/project/states.js'),
    `${readFileSync(resolve(targetRoot, 'src/project/states.js'), 'utf8')}\nexport const getStateOptions = (page) => pageStates[page] || [{ id: 'default', label: '默认态' }];\n`
  );
  write('src/project/directory.js', `import { pageStates } from './states.js';\nimport { BREAKDOWN_PROMPT_LIMIT, REPLACEMENT_IMAGE_RULE, SCRIPT_REWRITE_LIMIT } from './mock-data.js';\n\n${exportConstAndFunctions(`${pageDirectoryBlock}\n${directoryCopyBlock}\n${checklistBlock}`)}\n`);
  write('src/project/mock-data.js', exportConstAndFunctions(`${constantsBlock}\n${featureLogicBlock}`));
  write('src/project/notes/page-copy.js', `import { BREAKDOWN_PROMPT_LIMIT, featureLogic, REPLACEMENT_IMAGE_RULE, SCRIPT_REWRITE_LIMIT } from '../mock-data.js';\n\n${exportConstAndFunctions(pageCopyBlock)}\n`);
  write('src/project/notes/interactions.js', `import { BREAKDOWN_PROMPT_LIMIT, REPLACEMENT_IMAGE_RULE, SCRIPT_REWRITE_LIMIT } from '../mock-data.js';\nimport { videoStyleConfigs } from '../states.js';\n\n${exportConstAndFunctions(interactionsBlock).replace('export const pageInteractions = {', 'export const pageInteractionsByState = {')}\n\nexport const pageInteractions = {\n  upload: pageInteractionsByState.upload?.unuploaded || [],\n  analysis: pageInteractionsByState.analysis?.[videoStyleConfigs[0]?.stateId] || pageInteractionsByState.analysis?.parsing || [],\n  generate: pageInteractionsByState.generate?.generating || [],\n  styleAppendix: pageInteractionsByState.styleAppendix?.default || []\n};\n`);
  write('src/project/notes/index.js', `export * from './page-copy.js';\nexport * from './interactions.js';\n`);
  write('src/project/specs.js', `${exportConstAndFunctions(specsBlock)}

export const uiThemeSpec = uiColorSpec.map((item) => ({
  theme: '项目默认',
  variable: item.name,
  token: item.token,
  usage: item.usage
}));

export const uiButtonSpec = [
  { name: '描边线宽', value: '1px solid', usage: '普通按钮、输入边界、控件分隔线统一使用 1px。' },
  { name: '主按钮', value: '44px 高 / 12px 圆角', usage: '底部主操作和确认操作。' },
  { name: '次按钮', value: '44px 高 / 12px 圆角', usage: '取消、返回、辅助操作。' }
];

export const uiPlaceholderSpec = [
  { name: '模板/素材封面', value: '3:4 / 12px 圆角', usage: '纯灰色色块，标题放封面下方，封面内不写文字。' },
  { name: '视频封面', value: '3:4 / 12px 圆角', usage: '只允许叠加播放图标。' },
  { name: '大预览区', value: '4:5 左右 / 16px 圆角', usage: '用于视频、作品预览等主视觉区域。' }
];
`);
  write('src/project/routing.js', `import { pageDirectory } from './directory.js';\nimport { pageStates } from './states.js';\n\n${routeHelpers}`);
  write('src/project/prompts.js', exportConstAndFunctions(promptDataBlock));
  write('src/project/test-cases/index.js', `
export function getTestCasesForState(ctx, interactions = []) {
  const pageNumber = ctx?.pageNumber || ctx?.page || 'P';
  const stateNumber = ctx?.stateNumber || ctx?.stateId || 'S';
  return {
    functional: interactions.map((item, index) => ({
      id: \`TC-\${pageNumber}-\${stateNumber}-\${index + 1}-F\`,
      title: \`\${item.title}正常操作\`,
      steps: item.trigger || '按交互说明操作。',
      expected: item.effect || '结果符合交互说明。'
    })),
    boundary: interactions.filter((item) => item.bounds).map((item, index) => ({
      id: \`TC-\${pageNumber}-\${stateNumber}-\${index + 1}-B\`,
      title: \`\${item.title}边界校验\`,
      steps: item.bounds,
      expected: '边界内允许继续，超出边界给出明确提示。'
    })),
    exception: interactions.filter((item) => item.exceptions).map((item, index) => ({
      id: \`TC-\${pageNumber}-\${stateNumber}-\${index + 1}-E\`,
      title: \`\${item.title}异常处理\`,
      steps: item.exceptions,
      expected: '异常状态可恢复，不阻断其他已完成内容。'
    })),
    permission: [],
    tracking: interactions.map((item, index) => ({
      id: \`TC-\${pageNumber}-\${stateNumber}-\${index + 1}-T\`,
      title: \`\${item.title}埋点校验\`,
      steps: '触发该交互。',
      expected: '记录点击、来源页面、状态编号和结果。'
    }))
  };
}
`);
  write('src/project/project-data.js', `export * from './meta.js';\nexport * from './directory.js';\nexport * from './states.js';\nexport * from './mock-data.js';\nexport * from './routing.js';\nexport * from './notes/index.js';\nexport * from './test-cases/index.js';\nexport * from './specs.js';\nexport * from './prompts.js';\n`);
  write('src/project/routes.jsx', `import ReplicaScreen from '../pages/video-replication/ReplicaScreen.jsx';\n\n${routeRenderBlock.replace('function renderPhoneScreen', 'export function renderPhoneScreen')}\n`);
  write('src/pages/video-replication/ReplicaScreen.jsx', `import { useEffect, useRef, useState } from 'react';\nimport { AlertCircle, CheckCircle2, Copy, Film, Image, Link, Loader2, Play, WandSparkles } from 'lucide-react';\nimport { bindInteraction } from '../../framework/interaction.js';\nimport { BREAKDOWN_PROMPT_LIMIT, getVideoStyleByLabel, getVideoStyleByState, REPLACEMENT_IMAGE_RULE, SCRIPT_REWRITE_LIMIT, videoStyleConfigs } from '../../project/project-data.js';\n\n${replicaBlock.replace('function ReplicaScreen', 'export default function ReplicaScreen')}\n`);
  write('src/framework/PhoneFrame.jsx', `import { useState } from 'react';\nimport { ChevronLeft } from 'lucide-react';\nimport { bindInteraction } from './interaction.js';\nimport { getProjectDefaultTheme, getVideoStyleByLabel, pageDirectory } from '../project/project-data.js';\nimport { renderPhoneScreen } from '../project/routes.jsx';\n\n${shellHelperBlock}\n${phoneBlock.replace('function PhoneFrame', 'export default function PhoneFrame')}\n`);
  write('src/app/App.jsx', `import { useEffect, useState } from 'react';\nimport ConnectorOverlay from '../framework/ConnectorOverlay.jsx';\nimport PageDirectory from '../framework/PageDirectory.jsx';\nimport PhoneFrame from '../framework/PhoneFrame.jsx';\nimport ProjectSettingsRail from '../framework/ProjectSettingsRail.jsx';\nimport PrototypeStage from '../framework/PrototypeStage.jsx';\nimport SpecPanel from '../framework/SpecPanel.jsx';\nimport UpdateBanner from '../framework/UpdateBanner.jsx';\nimport UIDesignChecklistPage from '../docs/UIDesignChecklistPage.jsx';\nimport UISpecPage from '../docs/UISpecPage.jsx';\nimport PromptDocsPage from '../docs/PromptDocsPage.jsx';\nimport StyleAppendixPage from '../docs/StyleAppendixPage.jsx';\nimport { getPageReadStorageKey, getPageUpdateKey, getProjectDefaultTheme, getPrototypeHash, getThemeStorageKey, pageCopy, pageDirectory, pageStates, parsePrototypeHash } from '../project/project-data.js';\n\n${appBlock
    .replace('function App()', 'export default function App()')
    .replace("const [page, setPage] = useState('upload');", "const initialRoute = parsePrototypeHash();\n  const [page, setPage] = useState(initialRoute.page);")
    .replace("const [stateByPage, setStateByPage] = useState({ upload: 'unuploaded', analysis: 'parsing' });", "const [stateByPage, setStateByPage] = useState(() => ({ upload: 'unuploaded', analysis: 'parsing', ...(initialRoute.stateId ? { [initialRoute.page]: initialRoute.stateId } : {}) }));")
    .replace(/<PrototypeStage page=\{page\} stateId=\{stateId\}/g, '<PrototypeStage page={page} activeState={stateId}')
    .replace(`  useEffect(() => {
    setActiveInteraction(null);
  }, [page, stateId]);
`, `  useEffect(() => {
    setActiveInteraction(null);
  }, [page, stateId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncFromHash = () => {
      const next = parsePrototypeHash();
      setPage(next.page);
      if (next.stateId) setStateByPage((current) => ({ ...current, [next.page]: next.stateId }));
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nextHash = getPrototypeHash(page, stateId);
    if (window.location.hash !== nextHash) window.history.replaceState(null, '', nextHash);
  }, [page, stateId]);
`)}
`);
  write('src/docs/UIDesignChecklistPage.jsx', `import { useEffect, useRef, useState } from 'react';\nimport PrototypeStage from '../framework/PrototypeStage.jsx';\nimport PhoneFrame from '../framework/PhoneFrame.jsx';\nimport { directoryStatusCopy, getChecklistTarget, getPageUpdateKey, getVideoStyleByState, pageDirectory, uiDesignChecklist } from '../project/project-data.js';\n\n${checklistPageBlock.replace('function UIDesignChecklistPage', 'export default function UIDesignChecklistPage')}\n`);
  write('src/docs/PromptDocsPage.jsx', `import { useState } from 'react';\nimport { Copy } from 'lucide-react';\nimport { promptDocs } from '../project/project-data.js';\n\n${promptsBlock.replace('function PromptDocsPage', 'export default function PromptDocsPage')}\n`);
  write('src/docs/StyleAppendixPage.jsx', `import { bindInteraction } from '../framework/interaction.js';\nimport { videoStyleConfigs } from '../project/project-data.js';\n\n${appendixBlock.replace('function StyleAppendixPage', 'export default function StyleAppendixPage')}\n`);
  write('src/pages/index.js', `export { default as ReplicaScreen } from './video-replication/ReplicaScreen.jsx';\n`);
  write('src/pages/styles/pages.css', filterProjectCss(css));
  write('src/styles.css', `@import './prototype-ui/tokens.css';\n@import './prototype-ui/patterns.css';\n@import './pages/styles/pages.css';\n`);
}

function rebuildAiToolViaSemanticSplitter(source, css) {
  stage('recognizer', 'done', 'ai-tool legacy semantic splitter');
  write('src/legacy/LegacyApp.jsx', source
    .replace(/import\s+\{\s*createRoot\s*\}\s+from\s+['"]react-dom\/client['"];\n/, '')
    .replace(/import\s+['"]\.\/styles\.css['"];\n/, '')
    .replace(/createRoot\(document\.getElementById\(['"]root['"]\)\)\.render\(<App \/>\);?/, 'export default App;'));
  write('src/legacy/legacy.css', css);
  run('node', [resolve(skillRoot, 'scripts/semantic-split-legacy-app.mjs'), targetRoot, '--skip-verify']);
}

function verify() {
  const packagePath = resolve(targetRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['mlp:rebuild-from-legacy'] = `node ${resolve(skillRoot, 'scripts/rebuild-project-from-legacy.mjs')} ${legacyRoot} . --force`;
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  if (options.skipVerify) return;
  if (!existsSync(resolve(targetRoot, 'node_modules'))) {
    const legacyBaseSlug = basename(legacyRoot).replace(/\.backup\..*$/, '');
    const dependencyCandidates = [
      resolve(legacyRoot, 'node_modules'),
      resolve(defaultProjectRoot, legacyBaseSlug, 'node_modules')
    ];
    const reusableNodeModules = dependencyCandidates.find((candidate) => existsSync(candidate));
    if (reusableNodeModules) {
      cpSync(reusableNodeModules, resolve(targetRoot, 'node_modules'), { recursive: true });
      stage('reuse dependencies', 'done', `copied ${reusableNodeModules}`);
    } else {
      run('npm', ['install', '--cache', '.npm-cache']);
    }
  }
  run('npm', ['run', 'mlp:acceptance']);
}

if (!existsSync(legacyRoot)) fail(`Legacy project not found: ${legacyRoot}`);
if (options.dryRun) {
  console.log([
    `Legacy: ${legacyRoot}`,
    `Target: ${targetRoot}`,
    `Template: ${templateRoot}`,
    'Plan: copy latest framework -> import legacy source -> recognize business shape -> rebuild pages/data/docs -> sync complete framework layer -> acceptance'
  ].map((item) => `- ${item}`).join('\n'));
  process.exit(0);
}

copyFrameworkTemplate();

try {
  const { source } = readLegacySource();
  const css = readLegacyCss();
  if (source.includes('function ReplicaScreen') && source.includes('const videoStyleConfigs = [')) {
    rebuildVideoReplication(source, css);
  } else if (source.includes('function HomeScreen') && source.includes('function SpecPanel') && source.includes('const project = {')) {
    rebuildAiToolViaSemanticSplitter(source, css);
  } else {
    fail('Unsupported legacy project shape. Add a recognizer before rebuilding this project.');
  }
  verify();
  report.status = 'passed';
  stage('rebuild complete', 'done', targetRoot);
  saveReport();
} catch (error) {
  fail(error?.stack || error?.message || String(error));
}
