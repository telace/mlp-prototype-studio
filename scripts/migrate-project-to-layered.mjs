import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templateRoot = resolve(skillRoot, 'assets/framework-template');
const defaultProjectRoot = resolve(process.env.MLP_PROJECT_ROOT || `${process.env.HOME}/Documents/Codex/mlp-projects`);

const args = process.argv.slice(2);
const options = {
  dryRun: false,
  force: false,
  skipVerify: false
};
let projectArg = '';

for (const arg of args) {
  if (arg === '--dry-run') options.dryRun = true;
  else if (arg === '--force') options.force = true;
  else if (arg === '--skip-verify') options.skipVerify = true;
  else if (!projectArg) projectArg = arg;
  else {
    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
}

if (!projectArg) {
  console.error('Usage: migrate-project-to-layered.mjs <project-slug-or-absolute-path> [--dry-run] [--force] [--skip-verify]');
  process.exit(1);
}

const projectRoot = projectArg.startsWith('/') ? resolve(projectArg) : resolve(defaultProjectRoot, projectArg);
const srcRoot = resolve(projectRoot, 'src');
const mainPath = resolve(srcRoot, 'main.jsx');
const stylesPath = resolve(srcRoot, 'styles.css');
const legacyStylesPath = resolve(srcRoot, 'legacy/legacy.css');
const packagePath = resolve(projectRoot, 'package.json');
const appPath = resolve(srcRoot, 'app/App.jsx');
const legacyPath = resolve(srcRoot, 'legacy/LegacyApp.jsx');
const templateSrc = resolve(templateRoot, 'src');
const templateReview = resolve(templateRoot, 'scripts/mlp-loop-review.mjs');
const projectReview = resolve(projectRoot, 'scripts/mlp-loop-review.mjs');

const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const backupRoot = resolve(dirname(projectRoot), `${basename(projectRoot)}.backup.layered-${timestamp}`);

const log = (message) => console.log(message);
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!existsSync(packagePath) || !existsSync(mainPath) || !existsSync(stylesPath)) {
  fail(`Not an MLP React project or missing required files: ${projectRoot}`);
}

if (existsSync(appPath) && existsSync(legacyPath) && !options.force) {
  log(`Project already appears migrated: ${projectRoot}`);
  log('Use --force only if you intentionally want to rerun the compatibility migration.');
  process.exit(0);
}

const projectMain = readFileSync(mainPath, 'utf8');
if (!/createRoot\(document\.getElementById\(['"]root['"]\)\)\.render\(<App \/>\);/.test(projectMain)) {
  fail('Cannot safely migrate: expected createRoot(...).render(<App />) entry was not found in src/main.jsx.');
}
if (!/function App\(/.test(projectMain)) {
  fail('Cannot safely migrate: expected function App(...) was not found in src/main.jsx.');
}

const planned = [
  `Project: ${projectRoot}`,
  `Backup: ${backupRoot}`,
  'Create layered directories: src/app, src/framework, src/prototype-ui, src/project, src/pages, src/docs, src/legacy',
  'Move current src/main.jsx implementation into src/legacy/LegacyApp.jsx',
  'Replace src/main.jsx with a thin entrypoint',
  'Create src/app/App.jsx as compatibility wrapper',
  'Copy latest template framework/prototype-ui/project/docs/pages files for staged migration',
  'Install latest mlp-loop-review.mjs and package scripts',
  options.skipVerify ? 'Skip verification' : 'Run npm run mlp:review and npm run build'
];

if (options.dryRun) {
  log(planned.map((item) => `- ${item}`).join('\n'));
  process.exit(0);
}

log(planned.map((item) => `- ${item}`).join('\n'));

if (existsSync(backupRoot)) {
  fail(`Backup target already exists: ${backupRoot}`);
}

cpSync(projectRoot, backupRoot, {
  recursive: true,
  filter: (source) => {
    const name = basename(source);
    return !['node_modules', 'dist', '.npm-cache', '.playwright-cli'].includes(name);
  }
});

const copyTemplateDir = (name) => {
  const source = resolve(templateSrc, name);
  const target = resolve(srcRoot, name);
  if (!existsSync(source)) return;
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
};

for (const dir of ['framework', 'prototype-ui', 'project', 'pages', 'docs']) {
  copyTemplateDir(dir);
}

mkdirSync(resolve(srcRoot, 'app'), { recursive: true });
mkdirSync(resolve(srcRoot, 'legacy'), { recursive: true });
mkdirSync(resolve(projectRoot, 'scripts'), { recursive: true });

const legacySource = projectMain
  .replace(/import\s+\{\s*createRoot\s*\}\s+from\s+['"]react-dom\/client['"];\n/, '')
  .replace(/import\s+['"]\.\/styles\.css['"];\n/, '')
  .replace(/createRoot\(document\.getElementById\(['"]root['"]\)\)\.render\(<App \/>\);/, 'export default App;')
  .replace(
    'function App() {',
    `function parseLegacyRoute() {
  if (typeof window === 'undefined') return { page: pageDirectory[0]?.id || 'sample', stateId: null };
  const [pageCandidate, stateCandidate] = window.location.hash.replace(/^#\\/?/, '').split('/').filter(Boolean);
  const fallbackPage = pageDirectory[0]?.id || 'sample';
  const page = pageDirectory.some((item) => item.id === pageCandidate) ? pageCandidate : fallbackPage;
  const states = pageStates[page] || [{ id: 'default' }];
  const stateId = states.some((state) => state.id === stateCandidate) ? stateCandidate : states[0]?.id || null;
  return { page, stateId };
}

function getLegacyRouteHash(page, stateId) {
  const normalizedState = stateId && stateId !== 'default' ? \`/\${stateId}\` : '';
  return \`#/\${page}\${normalizedState}\`;
}

function App() {`
  )
  .replace(
    "const [page, setPage] = useState('upload');\n  const [stateByPage, setStateByPage] = useState({ upload: 'unuploaded', analysis: 'parsing' });",
    `const initialRoute = parseLegacyRoute();
  const [page, setPage] = useState(initialRoute.page);
  const [stateByPage, setStateByPage] = useState(() => ({
    upload: 'unuploaded',
    analysis: 'parsing',
    ...(initialRoute.stateId ? { [initialRoute.page]: initialRoute.stateId } : {})
  }));`
  )
  .replace(
    `  useEffect(() => {
    setActiveInteraction(null);
  }, [page, stateId]);
`,
    `  useEffect(() => {
    setActiveInteraction(null);
  }, [page, stateId]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncFromHash = () => {
      const next = parseLegacyRoute();
      setPage(next.page);
      if (next.stateId) {
        setStateByPage((current) => ({ ...current, [next.page]: next.stateId }));
      }
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nextHash = getLegacyRouteHash(page, stateId);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, [page, stateId]);
`
  )
  .replace(/\bmodal-layer\b/g, 'mlp-legacy-modal-layer')
  .replace(/\bmodal-backdrop\b/g, 'mlp-legacy-modal-backdrop')
  .replace(/\bprototype-modal\b/g, 'mlp-legacy-prototype-modal')
  .replace(/\bmodal-actions\b/g, 'mlp-legacy-modal-actions')
  .replace(/\balbum-backdrop\b/g, 'mlp-legacy-album-backdrop');

writeFileSync(legacyPath, legacySource);

const legacyStyles = readFileSync(stylesPath, 'utf8')
  .replace(/\bmodal-layer\b/g, 'mlp-legacy-modal-layer')
  .replace(/\bmodal-backdrop\b/g, 'mlp-legacy-modal-backdrop')
  .replace(/\bprototype-modal\b/g, 'mlp-legacy-prototype-modal')
  .replace(/\bmodal-actions\b/g, 'mlp-legacy-modal-actions')
  .replace(/\balbum-backdrop\b/g, 'mlp-legacy-album-backdrop');
writeFileSync(legacyStylesPath, legacyStyles);

writeFileSync(appPath, `import LegacyApp from '../legacy/LegacyApp.jsx';

export default function App() {
  return <LegacyApp />;
}
`);

writeFileSync(mainPath, `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);
`);

writeFileSync(stylesPath, `@import './prototype-ui/tokens.css';
@import './prototype-ui/patterns.css';
@import './pages/styles/pages.css';
@import './legacy/legacy.css';
`);

copyFileSync(templateReview, projectReview);

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts['mlp:review'] = 'node scripts/mlp-loop-review.mjs';
packageJson.scripts['mlp:framework-sync'] = `node ${resolve(skillRoot, 'scripts/sync-framework-guards.mjs')} .`;
packageJson.scripts['mlp:migrate-layered'] = `node ${resolve(skillRoot, 'scripts/migrate-project-to-layered.mjs')} .`;
packageJson.scripts['mlp:migrate-full'] = `node ${resolve(skillRoot, 'scripts/migrate-project-full.mjs')} .`;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

if (!options.skipVerify) {
  const run = (command, commandArgs) => {
    log(`\n$ ${command} ${commandArgs.join(' ')}`);
    const result = spawnSync(command, commandArgs, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: false
    });
    if (result.status !== 0) {
      fail(`Migration verification failed. Backup is available at: ${backupRoot}`);
    }
  };

  if (!existsSync(resolve(projectRoot, 'node_modules'))) {
    run('npm', ['install', '--cache', '.npm-cache']);
  }
  run('npm', ['run', 'mlp:review']);
  run('npm', ['run', 'build']);
}

log(`\nLayered compatibility migration complete: ${projectRoot}`);
log(`Backup kept at: ${backupRoot}`);
log('Next step: gradually move legacy page/data/docs code out of src/legacy/LegacyApp.jsx into src/project, src/pages, and src/docs.');
