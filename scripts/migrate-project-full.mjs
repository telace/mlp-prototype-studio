import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultProjectRoot = resolve(process.env.MLP_PROJECT_ROOT || `${process.env.HOME}/Documents/Codex/mlp-projects`);

const args = process.argv.slice(2);
const options = {
  dryRun: false,
  skipVerify: false,
  skipRuntime: false,
  keepFailed: false,
  force: false
};
let projectArg = '';

for (const arg of args) {
  if (arg === '--dry-run') options.dryRun = true;
  else if (arg === '--skip-verify') options.skipVerify = true;
  else if (arg === '--skip-runtime') options.skipRuntime = true;
  else if (arg === '--keep-failed') options.keepFailed = true;
  else if (arg === '--force') options.force = true;
  else if (!projectArg) projectArg = arg;
  else {
    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
}

if (!projectArg) {
  console.error('Usage: migrate-project-full.mjs <project-slug-or-absolute-path> [--dry-run] [--skip-verify] [--skip-runtime] [--keep-failed] [--force]');
  process.exit(1);
}

const projectRoot = projectArg.startsWith('/') || projectArg === '.' || projectArg.startsWith('./') || projectArg.startsWith('../')
  ? resolve(projectArg)
  : resolve(defaultProjectRoot, projectArg);
const packagePath = resolve(projectRoot, 'package.json');
const srcRoot = resolve(projectRoot, 'src');
const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const backupRoot = resolve(dirname(projectRoot), `${basename(projectRoot)}.backup.full-${timestamp}`);
const reportDir = resolve(projectRoot, '.mlp/migration/reports');
const reportPath = resolve(reportDir, `${timestamp}.json`);
const reportMarkdownPath = resolve(reportDir, `${timestamp}.md`);

const report = {
  version: 1,
  startedAt: new Date().toISOString(),
  finishedAt: null,
  projectRoot,
  backupRoot,
  options,
  status: 'running',
  stages: [],
  audits: {},
  failures: []
};

function log(message) {
  console.log(message);
}

function recordStage(name, status, detail = {}) {
  report.stages.push({
    name,
    status,
    detail,
    at: new Date().toISOString()
  });
}

function saveReport() {
  report.finishedAt = new Date().toISOString();
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  const lines = [
    `# MLP Full Migration Report`,
    ``,
    `- Project: ${projectRoot}`,
    `- Status: ${report.status}`,
    `- Backup: ${backupRoot}`,
    `- Started: ${report.startedAt}`,
    `- Finished: ${report.finishedAt}`,
    ``,
    `## Verification Summary`,
    `- Structure migration: ${report.stages.some((stage) => stage.name.includes('split') && stage.status === 'done') ? 'done' : 'not confirmed'}`,
    `- Complete framework layer sync: ${report.stages.some((stage) => stage.name.includes('framework-sync') && stage.status === 'done') ? 'done' : 'not confirmed'}`,
    `- Business style migration: ${report.audits.after?.blockers?.some((item) => item.includes('pages.css') || item.includes('styles.css')) ? 'has blocking findings' : 'no blocking findings reported by audit'}`,
    `- Runtime route review: ${report.stages.some((stage) => stage.name === 'acceptance' && stage.status === 'done') ? 'passed through mlp:acceptance' : 'not passed'}`,
    `- Visual review: explicit only; not run by migration unless requested separately with mlp:visual-acceptance`,
    `- Human visual confirmation: not implied by this report; user or reviewer must inspect screenshots when visual risk remains.`,
    ``,
    `## Stages`,
    ...report.stages.map((stage) => `- ${stage.status.toUpperCase()} ${stage.name}${stage.detail?.summary ? `: ${stage.detail.summary}` : ''}`),
    ``,
    `## Blocking Findings`,
    ...Object.entries(report.audits)
      .flatMap(([name, audit]) => (audit.blockers || []).map((item) => `- ${name}: ${item}`)),
    ...(report.failures.length ? ['', '## Failures', ...report.failures.map((item) => `- ${item}`)] : [])
  ];
  writeFileSync(reportMarkdownPath, `${lines.join('\n')}\n`);
}

function fail(message) {
  report.status = 'failed';
  report.failures.push(message);
  console.error(message);
  if (existsSync(backupRoot) && !options.keepFailed) {
    console.error(`Restoring project from backup: ${backupRoot}`);
    rmSync(projectRoot, { recursive: true, force: true });
    cpSync(backupRoot, projectRoot, { recursive: true });
    recordStage('rollback', 'done', { summary: 'restored project from full migration backup' });
  } else if (existsSync(backupRoot)) {
    console.error(`Failed project kept in place. Backup is available at: ${backupRoot}`);
  }
  saveReport();
  process.exit(1);
}

function run(command, commandArgs, stageName, runOptions = {}) {
  log(`\n$ ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: runOptions.cwd || projectRoot,
    encoding: 'utf8',
    shell: false,
    env: { ...process.env, ...(runOptions.env || {}) }
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  const detail = {
    command: `${command} ${commandArgs.join(' ')}`,
    status: result.status,
    stdout: (result.stdout || '').slice(-8000),
    stderr: (result.stderr || '').slice(-8000)
  };
  recordStage(stageName, result.status === 0 ? 'done' : 'failed', detail);
  if (result.status !== 0) {
    fail(`${stageName} failed with exit code ${result.status}`);
  }
  return result;
}

function collectFiles(dir, extensions) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return collectFiles(fullPath, extensions);
    return extensions.includes(extname(fullPath)) ? [fullPath] : [];
  });
}

function isOldSingleFileMlpProject() {
  const mainPath = resolve(srcRoot, 'main.jsx');
  if (!existsSync(mainPath)) return false;
  if (existsSync(resolve(srcRoot, 'app/App.jsx'))) return false;
  const source = readFileSync(mainPath, 'utf8');
  return source.includes('const project = {')
    && source.includes('function App(')
    && source.includes('createRoot(document.getElementById');
}

function canRunSemanticLegacySplit() {
  const legacyPath = resolve(projectRoot, 'src/legacy/LegacyApp.jsx');
  if (!existsSync(legacyPath)) return false;
  const source = readFileSync(legacyPath, 'utf8');
  return ['const project = {', 'function App()', 'function PhoneFrame', 'function HomeScreen', 'function SpecPanel']
    .every((marker) => source.includes(marker));
}

function auditProject() {
  const sourceFiles = collectFiles(srcRoot, ['.js', '.jsx']);
  const cssFiles = collectFiles(srcRoot, ['.css']);
  const css = cssFiles.map((file) => `\n/* ${relative(projectRoot, file)} */\n${readFileSync(file, 'utf8')}`).join('\n');
  const blockers = [];
  const warnings = [];
  const pagesRootFiles = sourceFiles
    .map((file) => relative(projectRoot, file))
    .filter((file) => /^src\/pages\/[^/]+\.jsx?$/.test(file));
  const allowedPagesRootFiles = new Set(['src/pages/index.js', 'src/pages/AiToolScreens.jsx']);
  const unexpectedPages = pagesRootFiles.filter((file) => !allowedPagesRootFiles.has(file));
  if (unexpectedPages.length) blockers.push(`页面文件仍在 src/pages 根目录: ${unexpectedPages.join(', ')}`);

  const aiToolScreensPath = resolve(projectRoot, 'src/pages/AiToolScreens.jsx');
  if (existsSync(aiToolScreensPath)) {
    const text = readFileSync(aiToolScreensPath, 'utf8');
    if (/function\s+\w+Screen\s*\(/.test(text) || text.split('\n').length > 20) {
      blockers.push('src/pages/AiToolScreens.jsx 仍是页面大文件，不是兼容 barrel');
    }
  }

  const requiredProjectFiles = [
    'src/project/meta.js',
    'src/project/directory.js',
    'src/project/states.js',
    'src/project/mock-data.js',
    'src/project/routing.js',
    'src/project/notes/index.js',
    'src/project/test-cases/index.js',
    'src/project/project-data.js'
  ];
  const missingProjectFiles = requiredProjectFiles.filter((file) => !existsSync(resolve(projectRoot, file)));
  if (missingProjectFiles.length) blockers.push(`项目数据结构缺失: ${missingProjectFiles.join(', ')}`);
  if (existsSync(resolve(projectRoot, 'src/legacy/LegacyApp.jsx'))) {
    blockers.push('src/legacy/LegacyApp.jsx 仍存在：完整迁移不能以兼容层作为最终结果，必须语义拆分到 src/project、src/pages、src/framework、src/docs');
  }

  for (const file of sourceFiles.filter((item) => relative(projectRoot, item).startsWith('src/pages/'))) {
    const rel = relative(projectRoot, file);
    const text = readFileSync(file, 'utf8');
    for (const legacy of ['modal-layer', 'prototype-modal', 'login-modal-backdrop', 'album-backdrop']) {
      if (text.includes(legacy)) blockers.push(`${rel} 保留旧手写弹层: ${legacy}`);
    }
    for (const match of text.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g)) {
      const imports = match[1].split(',').map((item) => item.trim()).filter(Boolean);
      if (imports.length > 12) warnings.push(`${rel} lucide-react 导入过宽: ${imports.length} 个`);
    }
    for (const match of text.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"][^'"]*project-data\.js['"]/g)) {
      const imports = match[1].split(',').map((item) => item.trim()).filter(Boolean);
      if (imports.length > 8) warnings.push(`${rel} project-data 导入过宽: ${imports.length} 个`);
    }
  }

  const pagesCssPath = resolve(projectRoot, 'src/pages/styles/pages.css');
  const rootStylesPath = resolve(projectRoot, 'src/styles.css');
  if (!existsSync(pagesCssPath)) blockers.push('缺少 src/pages/styles/pages.css');
  if (existsSync(rootStylesPath)) {
    const rootStyles = readFileSync(rootStylesPath, 'utf8');
    if (!rootStyles.includes("@import './pages/styles/pages.css';") && !rootStyles.includes('@import "./pages/styles/pages.css";')) {
      blockers.push('src/styles.css 未导入 src/pages/styles/pages.css');
    }
    const lineCount = rootStyles.split('\n').length;
    if (lineCount > 1800) blockers.push(`src/styles.css 仍过重: ${lineCount} 行`);
  }
  if (existsSync(pagesCssPath)) {
    const pagesCss = readFileSync(pagesCssPath, 'utf8');
    for (const selector of ['.spec-panel', '.project-card', '.page-directory', '.checklist-stage', '.ui-spec-stage', '.phone {', '.statusbar', '.nav-bar', '.app-shell', '--workspace-']) {
      if (pagesCss.includes(selector)) blockers.push(`pages.css 包含框架壳层内容: ${selector}`);
    }
  }

  const appColorPattern = /(^|[\s,.#])(?:phone|screen|home-|profile-|ai-video|login|creation|member|vip|points|energy|result|template|asset|tabbar|bottom-|modal|album|component-screen|placeholder|upload|tool-)[^{]*\{[^{}]*(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))/g;
  for (const match of css.matchAll(appColorPattern)) {
    const snippet = match[0];
    if (!snippet.includes('var(') && !snippet.includes('phone[data-theme') && !snippet.includes('interaction-connector')) {
      warnings.push('手机原型页面存在疑似硬编码色值，最终以 npm run mlp:review 的精确检查为准');
      break;
    }
  }

  return { blockers: [...new Set(blockers)].sort(), warnings: [...new Set(warnings)].sort() };
}

if (!existsSync(packagePath) || !existsSync(srcRoot)) {
  console.error(`Not an MLP project: ${projectRoot}`);
  process.exit(1);
}

const planned = [
  `Project: ${projectRoot}`,
  `Backup: ${backupRoot}`,
  'Run pre-migration audit and save report',
  'Automatically run layered compatibility migration for old single-file MLP projects',
  'Sync latest framework guards, prototype-ui, review scripts, and package scripts',
  'Run semantic split when src/legacy/LegacyApp.jsx exists',
  'Run page/notes module split when compatible monolithic modules exist',
  'Run framework sync again to normalize scripts and guarded styles',
  options.skipVerify ? 'Skip acceptance verification' : 'Run npm install when needed, npm run mlp:review, npm run build, and runtime acceptance. Visual review is explicit-only.',
  options.keepFailed ? 'Keep failed project in place' : 'Rollback to backup automatically on failure'
];

if (options.dryRun) {
  console.log(planned.map((item) => `- ${item}`).join('\n'));
  process.exit(0);
}

log(planned.map((item) => `- ${item}`).join('\n'));

if (existsSync(backupRoot)) fail(`Backup target already exists: ${backupRoot}`);

cpSync(projectRoot, backupRoot, {
  recursive: true,
  filter: (sourcePath) => !['node_modules', 'dist', '.npm-cache', '.playwright-cli'].includes(basename(sourcePath))
});
recordStage('backup', 'done', { summary: `created ${backupRoot}` });

report.audits.before = auditProject();
recordStage('pre-audit', report.audits.before.blockers.length ? 'warn' : 'done', {
  summary: `${report.audits.before.blockers.length} blockers, ${report.audits.before.warnings.length} warnings before migration`
});

if (isOldSingleFileMlpProject()) {
  run('node', [resolve(skillRoot, 'scripts/migrate-project-to-layered.mjs'), projectRoot, '--skip-verify'], 'layered-compat-migration');
} else {
  recordStage('layered-compat-migration', 'skipped', { summary: 'project is not an old single-file MLP entry' });
}

run('node', [resolve(skillRoot, 'scripts/sync-framework-full.mjs'), projectRoot], 'framework-sync-1');

if (canRunSemanticLegacySplit()) {
  run('node', [resolve(skillRoot, 'scripts/semantic-split-legacy-app.mjs'), projectRoot, '--skip-verify'], 'semantic-split');
} else if (existsSync(resolve(projectRoot, 'src/legacy/LegacyApp.jsx'))) {
  recordStage('semantic-split', 'skipped', { summary: 'legacy app shape is not supported by semantic splitter; kept in compatibility layer' });
} else {
  recordStage('semantic-split', 'skipped', { summary: 'no src/legacy/LegacyApp.jsx found' });
}

run('node', [resolve(skillRoot, 'scripts/split-project-modules.mjs'), projectRoot], 'module-split');
run('node', [resolve(skillRoot, 'scripts/sync-framework-full.mjs'), projectRoot], 'framework-sync-2');

report.audits.after = auditProject();
recordStage('post-audit', report.audits.after.blockers.length ? 'warn' : 'done', {
  summary: `${report.audits.after.blockers.length} blockers, ${report.audits.after.warnings.length} warnings after migration`
});

if (report.audits.after.blockers.length && !options.force) {
  fail(`Post-migration audit has blocking findings. Re-run with --force only if you intentionally want acceptance to decide.\n- ${report.audits.after.blockers.join('\n- ')}`);
}

if (!options.skipVerify) {
  if (!existsSync(resolve(projectRoot, 'node_modules'))) {
    run('npm', ['install', '--cache', '.npm-cache'], 'npm-install');
  }
  if (options.skipRuntime) {
    run('npm', ['run', 'mlp:review'], 'static-review');
    run('npm', ['run', 'build'], 'build');
  } else {
    run('npm', ['run', 'mlp:acceptance'], 'acceptance');
  }
}

report.status = 'passed';
recordStage('complete', 'done', { summary: 'full migration pipeline passed' });
saveReport();

console.log(`\nMLP full migration complete: ${projectRoot}`);
console.log(`Backup kept at: ${backupRoot}`);
console.log(`Report: ${reportMarkdownPath}`);
