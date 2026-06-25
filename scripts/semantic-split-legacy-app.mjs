import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultProjectRoot = resolve(process.env.MLP_PROJECT_ROOT || `${process.env.HOME}/Documents/Codex/mlp-projects`);

const args = process.argv.slice(2);
const options = {
  dryRun: false,
  skipVerify: false
};
let projectArg = '';

for (const arg of args) {
  if (arg === '--dry-run') options.dryRun = true;
  else if (arg === '--skip-verify') options.skipVerify = true;
  else if (!projectArg) projectArg = arg;
  else {
    console.error(`Unknown argument: ${arg}`);
    process.exit(1);
  }
}

if (!projectArg) {
  console.error('Usage: semantic-split-legacy-app.mjs <project-slug-or-absolute-path> [--dry-run] [--skip-verify]');
  process.exit(1);
}

const projectRoot = projectArg.startsWith('/') ? resolve(projectArg) : resolve(defaultProjectRoot, projectArg);
const srcRoot = resolve(projectRoot, 'src');
const legacyPath = resolve(srcRoot, 'legacy/LegacyApp.jsx');
const packagePath = resolve(projectRoot, 'package.json');
const reviewPath = resolve(projectRoot, 'scripts/mlp-loop-review.mjs');
const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const backupRoot = resolve(dirname(projectRoot), `${basename(projectRoot)}.backup.semantic-${timestamp}`);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!existsSync(packagePath) || !existsSync(srcRoot)) {
  fail(`Not an MLP project: ${projectRoot}`);
}

if (!existsSync(legacyPath)) {
  fail(`No legacy app found at ${legacyPath}. Run migrate-project-to-layered first, or use this only on compatibility-migrated projects.`);
}

const source = readFileSync(legacyPath, 'utf8');
for (const marker of ['const project = {', 'function App()', 'function PhoneFrame', 'function HomeScreen', 'function SpecPanel']) {
  if (!source.includes(marker)) fail(`Cannot safely split legacy app: missing marker "${marker}".`);
}

const planned = [
  `Project: ${projectRoot}`,
  `Backup: ${backupRoot}`,
  'Split legacy data/helpers into src/project/project-data.js',
  'Split workbench/framework shell into src/framework/*.jsx',
  'Split prototype pages into src/pages/AiToolScreens.jsx',
  'Split docs into src/docs/*.jsx',
  'Rewrite src/app/App.jsx to import the layered modules',
  'Remove src/legacy after successful split because the timestamped backup keeps the original source',
  'Remove unused framework-template sample pages from the real project',
  options.skipVerify ? 'Skip verification' : 'Run npm run mlp:review and npm run build'
];

if (options.dryRun) {
  console.log(planned.map((item) => `- ${item}`).join('\n'));
  process.exit(0);
}

console.log(planned.map((item) => `- ${item}`).join('\n'));

cpSync(projectRoot, backupRoot, {
  recursive: true,
  filter: (sourcePath) => !['node_modules', 'dist', '.npm-cache', '.playwright-cli'].includes(basename(sourcePath))
});

const between = (start, end) => {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) fail(`Missing split start marker: ${start}`);
  const endIndex = end ? source.indexOf(end, startIndex) : source.length;
  if (end && endIndex < 0) fail(`Missing split end marker: ${end}`);
  return `${source.slice(startIndex, endIndex).trim()}\n`;
};

const write = (relativePath, content) => {
  const target = resolve(projectRoot, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
};

const exportTopLevel = (block) => block
  .replace(/^(const|function) /gm, 'export $1 ')
  .replace(/^export function App\(/m, 'export default function App(')
  .replace(/^export function ([A-Z][A-Za-z0-9_]*)\(/gm, 'export default function $1(');

const dataBlock = between('const project = {', 'function bindInteraction(');
const bindBlock = between('function bindInteraction(', 'function getVisibleInteractionSource(');
const connectorBlock = between('function getVisibleInteractionSource(', 'const VERSION_POLL_INTERVAL_MS');
const updateBlock = between('const VERSION_POLL_INTERVAL_MS', 'function App()');
const appBlock = between('function App()', 'function ProjectSettingsRail');
const settingsBlock = between('function ProjectSettingsRail', 'function PageDirectory');
const directoryBlock = between('function PageDirectory', 'function UIDesignChecklistPage');
const checklistBlock = between('function UIDesignChecklistPage', 'const uiColorSpec');
const uiSpecBlock = between('const uiColorSpec', 'function PrototypeStage');
const stageBlock = between('function PrototypeStage', 'function PhoneFrame');
const phoneBlock = between('function PhoneFrame', 'function HomeScreen');
const screensBlock = between('function HomeScreen', 'function SpecPanel');
const specPanelBlock = between('function SpecPanel', 'export default App;');
const routeStart = phoneBlock.indexOf('function renderPhoneScreen');
const backBarStart = phoneBlock.indexOf('function BackBar');
if (routeStart < 0 || backBarStart < 0 || backBarStart < routeStart) {
  fail('Cannot safely split PhoneFrame/routes: missing renderPhoneScreen or BackBar marker.');
}
const phoneShellBlock = `${phoneBlock.slice(0, routeStart).trim()}\n\n${phoneBlock.slice(backBarStart).trim()}\n`;
const routeRenderBlock = phoneBlock.slice(routeStart, backBarStart).trim();

const projectData = exportTopLevel(dataBlock)
  .replace(
    "export const validLoginStates = new Set([...loginCnStates, ...loginGlobalStates].map((item) => item.id));\n",
    "export const validLoginStates = new Set([...loginCnStates, ...loginGlobalStates].map((item) => item.id));\nexport const isValidLoginStateForPage = (page, state) => isLoginPage(page) && getLoginStates(page).some((item) => item.id === state);\n"
  )
  .replace(
    "loginState: isLoginPage(page) && validLoginStates.has(parts[1]) ? parts[1] : getDefaultLoginState(page)",
    "loginState: isValidLoginStateForPage(page, parts[1]) ? parts[1] : getDefaultLoginState(page)"
  )
  .replace(
    "if (isLoginPage(page)) return `#/${page}/${loginState}`;",
    "if (isLoginPage(page)) return `#/${page}/${isValidLoginStateForPage(page, loginState) ? loginState : getDefaultLoginState(page)}`;"
  );

write('src/project/project-data.js', projectData);
write('src/framework/interaction.js', bindBlock.replace('function bindInteraction', 'export function bindInteraction'));
write('src/framework/ConnectorOverlay.jsx', `import { useEffect, useState } from 'react';\n\n${connectorBlock.replace('function ConnectorOverlay', 'export default function ConnectorOverlay')}\n`);
write('src/framework/UpdateBanner.jsx', `import { useEffect, useRef, useState } from 'react';\n\n${updateBlock.replace('function UpdateBanner', 'export default function UpdateBanner')}\n`);
write('src/framework/ProjectSettingsRail.jsx', `import { BadgeCheck, Moon, Sun, WandSparkles } from 'lucide-react';\nimport { project } from '../project/project-data.js';\n\n${settingsBlock.replace('function ProjectSettingsRail', 'export default function ProjectSettingsRail')}\n`);
write('src/framework/PageDirectory.jsx', `import { ChevronRight } from 'lucide-react';\nimport { directoryStatusCopy, getPageUpdateKey, isCreateState, pageDirectory } from '../project/project-data.js';\n\n${directoryBlock.replace('function PageDirectory', 'export default function PageDirectory')}\n`);
write('src/docs/UIDesignChecklistPage.jsx', `import { directoryStatusCopy, getPageUpdateKey, pageDirectory, uiDesignChecklist } from '../project/project-data.js';\n\n${checklistBlock.replace('function UIDesignChecklistPage', 'export default function UIDesignChecklistPage')}\n`);
write('src/docs/UISpecPage.jsx', `${uiSpecBlock.replace('function UISpecPage', 'export default function UISpecPage')}\n`);
write('src/framework/PrototypeStage.jsx', `import { useEffect, useRef } from 'react';\nimport { aiVideoStates, createSubstates, getLoginStates, getPageNumber, isCreateState, isLoginPage, pageDirectory, profileStates, resultStates } from '../project/project-data.js';\n\n${stageBlock.replace('function PrototypeStage', 'export default function PrototypeStage')}\n`);
write('src/framework/PhoneFrame.jsx', `import { ChevronLeft } from 'lucide-react';\nimport { getPageShellConfig, pageCopy } from '../project/project-data.js';\nimport { renderPhoneScreen } from '../project/routes.jsx';\nimport { TabBar } from '../pages/AiToolScreens.jsx';\n\n${phoneShellBlock.replace('function PhoneFrame', 'export default function PhoneFrame')}\n`);
write('src/project/routes.jsx', `import {\n  AiVideoScreen,\n  ComponentLibraryScreen,\n  CreateScreen,\n  EnergyCenterScreen,\n  HomeScreen,\n  ListScreen,\n  LoginScreen,\n  MemberCenterScreen,\n  ProfileScreen,\n  ResultScreen\n} from '../pages/AiToolScreens.jsx';\n\n${routeRenderBlock.replace('function renderPhoneScreen', 'export function renderPhoneScreen')}\n`);
write('src/pages/AiToolScreens.jsx', `import { useState } from 'react';\nimport { BadgeCheck, ChevronLeft, ChevronRight, Crown, Download, Eraser, Grid2X2, Home, ImagePlus, Loader2, Mail, Play, Plus, Redo2, Search, Send, Settings, Share2, Sparkles, Undo2, User, WandSparkles, X } from 'lucide-react';\nimport { bindInteraction } from '../framework/interaction.js';\nimport { bodyTemplateCases, categories, creationRecords, getDefaultLoginState, homeFilters, homeRecommendations, pageCopy, videoTemplates } from '../project/project-data.js';\n\n${screensBlock}\nexport { HomeScreen, AiVideoScreen, ListScreen, ResultScreen, LoginScreen, CreateScreen, ProfileScreen, MemberCenterScreen, EnergyCenterScreen, ComponentLibraryScreen, TabBar };\n`);
write('src/framework/SpecPanel.jsx', `import { useEffect, useRef } from 'react';\nimport { BadgeCheck } from 'lucide-react';\nimport { getAiVideoStateInteractions, getPageNumber, getStateNumber, pageInteractions, videoTemplates } from '../project/project-data.js';\n\n${specPanelBlock.replace('function SpecPanel', 'export default function SpecPanel')}\n`);
write('src/app/App.jsx', `import { useEffect, useMemo, useRef, useState } from 'react';\nimport ConnectorOverlay from '../framework/ConnectorOverlay.jsx';\nimport PageDirectory from '../framework/PageDirectory.jsx';\nimport PhoneFrame from '../framework/PhoneFrame.jsx';\nimport ProjectSettingsRail from '../framework/ProjectSettingsRail.jsx';\nimport PrototypeStage from '../framework/PrototypeStage.jsx';\nimport SpecPanel from '../framework/SpecPanel.jsx';\nimport UpdateBanner from '../framework/UpdateBanner.jsx';\nimport UIDesignChecklistPage from '../docs/UIDesignChecklistPage.jsx';\nimport UISpecPage from '../docs/UISpecPage.jsx';\nimport { categories, getAiVideoStateSpec, getCanonicalPageId, getDefaultLoginState, getLoginStateSpec, getLoginStates, getPageReadStorageKey, getPageUpdateKey, getProfileStateSpec, getProjectDefaultTheme, getPrototypeHash, getResultStateSpec, getThemeStorageKey, isLoginPage, pageCopy, pageDirectory, parsePrototypeHash, readPageReadVersions, videoTemplates, writePageReadVersions } from '../project/project-data.js';\n\n${appBlock.replace('function App()', 'export default function App()')}\n`);

for (const stalePath of [
  'src/pages/SampleScreen.jsx',
  'src/pages/SecondaryExampleScreen.jsx',
  'src/pages/ComponentLibraryScreen.jsx',
  'src/pages/TabBar.jsx',
  'src/docs/PromptDocsPage.jsx'
]) {
  const absolute = resolve(projectRoot, stalePath);
  if (existsSync(absolute)) rmSync(absolute, { force: true });
}

if (existsSync(reviewPath)) {
  const review = readFileSync(reviewPath, 'utf8')
    .replace(
      "{ label: 'layered pages exist', source: main, snippet: 'src/pages/SampleScreen.jsx' }",
      "{ label: 'layered project pages exist', source: main, snippet: 'src/pages/AiToolScreens.jsx' }"
    );
  writeFileSync(reviewPath, review);
}

rmSync(resolve(srcRoot, 'legacy'), { recursive: true, force: true });

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts['mlp:semantic-split'] = `node ${resolve(skillRoot, 'scripts/semantic-split-legacy-app.mjs')} .`;
packageJson.scripts['mlp:migrate-full'] = `node ${resolve(skillRoot, 'scripts/migrate-project-full.mjs')} .`;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

if (!options.skipVerify) {
  const run = (command, commandArgs) => {
    console.log(`\n$ ${command} ${commandArgs.join(' ')}`);
    const result = spawnSync(command, commandArgs, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: false
    });
    if (result.status !== 0) {
      fail(`Semantic split verification failed. Backup is available at: ${backupRoot}`);
    }
  };
  run('npm', ['run', 'mlp:review']);
  run('npm', ['run', 'build']);
}

console.log(`\nSemantic layered split complete: ${projectRoot}`);
console.log(`Backup kept at: ${backupRoot}`);
