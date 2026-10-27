import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toPosix = (file) => relative(root, file).replaceAll('\\', '/');
const stylesPath = resolve(root, 'src/styles.css');
const srcRoot = resolve(root, 'src');
const packagePath = resolve(root, 'package.json');
const viteConfigPath = resolve(root, 'vite.config.js');
const projectMetaPath = resolve(root, '.mlp/project.json');
const collectFiles = (dir, extensions) => readdirSync(dir)
  .flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) return collectFiles(fullPath, extensions);
    return extensions.includes(extname(fullPath)) ? [fullPath] : [];
  })
  .sort();
const collectSourceFiles = (dir) => collectFiles(dir, ['.js', '.jsx']);
const collectCssFiles = (dir) => collectFiles(dir, ['.css']);
const sourceFiles = collectSourceFiles(srcRoot);
const cssFiles = collectCssFiles(srcRoot);
const usesLayeredArchitecture = sourceFiles.some((file) => toPosix(file) === 'src/app/App.jsx');
const main = sourceFiles
  .map((file) => `\n/* ${toPosix(file)} */\n${readFileSync(file, 'utf8')}`)
  .join('\n');
const styles = cssFiles
  .map((file) => `\n/* ${toPosix(file)} */\n${readFileSync(file, 'utf8')}`)
  .join('\n');
const rootStyles = readFileSync(stylesPath, 'utf8');
const pathExists = (relPath) => {
  try {
    statSync(resolve(root, relPath));
    return true;
  } catch {
    return false;
  }
};
const packageJson = pathExists('package.json') ? JSON.parse(readFileSync(packagePath, 'utf8')) : {};
const viteConfig = pathExists('vite.config.js') ? readFileSync(viteConfigPath, 'utf8') : '';
const isFrameworkTemplate = packageJson.name === 'mobile-lowfi-framework-template';
const projectMeta = pathExists('.mlp/project.json') ? JSON.parse(readFileSync(projectMetaPath, 'utf8')) : null;
const lifecycle = projectMeta?.lifecycle || (isFrameworkTemplate ? 'template' : 'prototype');
const isDiscovery = lifecycle === 'discovery';
let stateChecklistCoverage = [];
let numberingFindings = [];
let productPageCount = 0;
if (usesLayeredArchitecture) {
  try {
    const directoryModule = await import(`${pathToFileURL(resolve(root, 'src/project/directory.js')).href}?review=${Date.now()}`);
    const statesModule = await import(`${pathToFileURL(resolve(root, 'src/project/states.js')).href}?review=${Date.now()}`);
    const checklistKeys = new Set(directoryModule.uiDesignChecklist.map((item) => `${item.pageId}:${item.state}`));
    const productPages = directoryModule.pageDirectory.filter((item) => item.level !== 'docs' && item.group !== '规范/文档');
    stateChecklistCoverage = productPages.flatMap((page) => (statesModule.pageStateOptions[page.id] || [{ label: '默认态' }])
      .filter((state) => !checklistKeys.has(`${page.id}:${state.label}`))
      .map((state) => `${page.label}/${state.label}`));
    productPageCount = productPages.length;
    const pageNumbers = productPages.map((page) => String(page.number || ''));
    numberingFindings = [
      ...productPages.filter((page) => !/^\d+$/.test(String(page.number || ''))).map((page) => `${page.id} missing stable integer page number`),
      ...(new Set(pageNumbers).size !== pageNumbers.length ? ['duplicate real page numbers'] : [])
    ];
  } catch {
    stateChecklistCoverage = ['状态数据无法读取'];
    numberingFindings = ['numbering data cannot be read'];
  }
}

const uniq = (items) => [...new Set(items)].filter(Boolean).sort();
const countLinesBefore = (text, index) => text.slice(0, index).split('\n').length;

function extractBoundIds(source) {
  const ids = [];
  for (const match of source.matchAll(/bind(?:Interaction|Element)\(([^)]*)\)/g)) {
    for (const id of match[1].matchAll(/['"`]([^'"`]+)['"`]/g)) {
      if (id[1].includes('${')) continue;
      ids.push(id[1]);
    }
  }
  return uniq(ids);
}

function extractDocumentedIds(source) {
  const ids = [];
  const interactionObjectPattern = /\{[^{}]*id:\s*['"`]([^'"`]+)['"`][^{}]*title:\s*['"`][^'"`]+['"`][^{}]*(?:trigger|purpose|effect|dataSource|source)\s*:/g;
  for (const match of source.matchAll(interactionObjectPattern)) {
    ids.push(match[1]);
  }
  for (const match of source.matchAll(/\b(?:item|content)\(\s*['"`]([^'"`]+)['"`]/g)) {
    ids.push(match[1]);
  }
  for (const match of source.matchAll(/\btemplateItems\(\s*['"`]([^'"`]+)['"`]\s*,\s*(\d+)/g)) {
    const prefix = match[1];
    const count = Number(match[2]);
    for (let index = 1; index <= count; index += 1) ids.push(`${prefix}-${index}`);
  }
  return uniq(ids);
}

const dynamicSourceCandidates = [
  'create-erase',
  'create-redo',
  'create-smear',
  'create-undo'
];
const dynamicSourceIds = dynamicSourceCandidates.filter((id) => {
  return main.includes(`'${id}'`) || main.includes(`"${id}"`) || main.includes(`\`${id}\``);
});

const documentedIds = extractDocumentedIds(main);
const expectedDocumentedIds = uniq([...extractBoundIds(main), ...documentedIds, ...dynamicSourceIds]);
const generatedDocsPresent = documentedIds.length > 0;

const designContractPath = resolve(root, 'src/project/design.js');
const designContractSource = pathExists('src/project/design.js') ? readFileSync(designContractPath, 'utf8') : '';
const prdPath = resolve(root, 'docs/PRD.md');
const prdSource = pathExists('docs/PRD.md') ? readFileSync(prdPath, 'utf8') : '';
const prdPageSource = pathExists('src/docs/PRDPage.jsx') ? readFileSync(resolve(root, 'src/docs/PRDPage.jsx'), 'utf8') : '';
const appSource = pathExists('src/app/App.jsx') ? readFileSync(resolve(root, 'src/app/App.jsx'), 'utf8') : '';
const supportPagesSource = pathExists('src/framework/supportPages.js') ? readFileSync(resolve(root, 'src/framework/supportPages.js'), 'utf8') : '';
const settingsRailSource = pathExists('src/framework/ProjectSettingsRail.jsx') ? readFileSync(resolve(root, 'src/framework/ProjectSettingsRail.jsx'), 'utf8') : '';
const directorySource = pathExists('src/project/directory.js') ? readFileSync(resolve(root, 'src/project/directory.js'), 'utf8') : '';
const projectDataSource = pathExists('src/project/project-data.js')
  ? readFileSync(resolve(root, 'src/project/project-data.js'), 'utf8')
  : '';
const designContractChecks = [
  ['designContract export', /export\s+const\s+designContract\s*=/],
  ['PRD metadata', /prd\s*:\s*\{/],
  ['PRD path', /path:\s*['"]docs\/PRD\.md['"]/]
];
const requiredPrdSections = [
  '文档信息', '背景与问题', '产品目标', '非目标', '用户与场景', '用户流程', '功能范围', '页面与状态',
  '功能需求', '业务规则', '数据与集成', '异常与边界', '权限与合规', '数据分析与成功指标',
  '验收标准', '开放问题与假设', '变更记录'
];
const prdFailures = [
  !prdSource ? 'docs/PRD.md is missing' : '',
  ...requiredPrdSections.filter((heading) => !new RegExp(`^##\\s+\\d+\\.\\s+${heading}$`, 'm').test(prdSource))
    .map((heading) => `PRD中文章节缺失: ${heading}`),
  prdSource && !/^#\s+PRD[：:]\s*[^\n]+/m.test(prdSource) ? 'PRD中文标题缺失' : '',
  prdSource && !/^状态：(草稿|已同步)$/m.test(prdSource) ? 'PRD必须使用中文状态：草稿或已同步' : '',
  prdSource && !/^版本：[^\n]+$/m.test(prdSource) ? 'PRD必须使用中文版本标签' : '',
  /^(?:Status|Version|Updated at|Synced at):/m.test(prdSource) ? 'PRD不得使用英文元数据标签' : '',
  /^(?:##\s+\d+\.\s+)(?:Document Information|Background And Problem|Product Goals|Functional Requirements|Acceptance Criteria|Change Log)$/m.test(prdSource) ? 'PRD不得保留英文标准章节' : ''
].filter(Boolean);
const prdVisibilityFailures = [
  !prdPageSource.includes("../../docs/PRD.md?raw") ? 'PRD page does not bundle docs/PRD.md' : '',
  !appSource.includes("page === 'prd'") || !appSource.includes('<PRDPage />') ? 'App does not render the PRD support page' : '',
  !/id:\s*['"]prd['"][^\n]+placement:\s*['"]settings['"]/.test(supportPagesSource) ? 'PRD is not a settings support page' : '',
  !settingsRailSource.includes('prd: FileText') ? 'settings rail does not expose the PRD entry' : '',
  /(?:pageDirectory|uiDesignChecklist)[\s\S]*?id:\s*['"]prd['"]/.test(directorySource) ? 'PRD must not enter the product directory or UI checklist' : ''
].filter(Boolean);
const fixedDirectorySupportFailures = [
  !/id:\s*['"]uiChecklist['"][^\n]+label:\s*['"]UI设计清单['"][^\n]+group:\s*['"]规范\/文档['"]/.test(supportPagesSource) ? '页面目录缺少固定UI设计清单入口' : '',
  !/id:\s*['"]prompts['"][^\n]+label:\s*['"]提示词['"][^\n]+group:\s*['"]提示词['"]/.test(supportPagesSource) ? '页面目录缺少固定提示词入口' : '',
  /id:\s*['"](?:uiChecklist|prompts)['"][^\n]+placement:\s*['"](?:settings|hidden)['"]/.test(supportPagesSource) ? '固定UI设计清单或提示词入口不得隐藏或移出页面目录' : '',
  !supportPagesSource.includes('...supportPages.filter((page) => !existingIds.has(page.id) && !page.placement)') ? '固定支持板块未追加到产品页面目录之后' : ''
].filter(Boolean);
const missingDesignContractChecks = designContractChecks
  .filter(([, pattern]) => !pattern.test(designContractSource))
  .map(([label]) => label);
const designContractExportMissing = !projectDataSource.includes("export * from './design.js';");
let designContractRuntime = null;
let designContractLoadError = '';
if (pathExists('src/project/design.js')) {
  try {
    designContractRuntime = (await import(`${pathToFileURL(designContractPath).href}?review=${Date.now()}`)).designContract;
  } catch (error) {
    designContractLoadError = error.message;
  }
}
const prdRuntimeFailures = [
  designContractLoadError ? `design.js load failed: ${designContractLoadError}` : '',
  !isFrameworkTemplate && !isDiscovery && designContractRuntime?.prd?.status !== 'synced' ? 'PRD must be synced before prototype work' : ''
].filter(Boolean);
const lifecycleFailures = [
  !['template', 'discovery', 'prototype', 'review', 'released'].includes(lifecycle) ? `invalid lifecycle: ${lifecycle}` : '',
  isDiscovery && productPageCount > 0 ? 'discovery lifecycle must not contain product pages' : '',
  isDiscovery && designContractRuntime?.prd?.status !== 'draft' ? "discovery PRD status must be 'draft'" : '',
  !isFrameworkTemplate && !projectMeta ? '.mlp/project.json is missing' : '',
  projectMeta && !projectMeta.name ? '.mlp project name is missing' : '',
  projectMeta && !projectMeta.slug ? '.mlp project slug is missing' : ''
].filter(Boolean);

function findWorkspaceThemeLeaks(css) {
  const findings = [];
  const workspaceSelectorPattern = /(?:^|,)\s*(?::root|body|\.app-shell|\.workspace|\.project-settings-rail|\.left-rail|\.project-card|\.theme-card|\.theme-toggle|\.segmented-toggle|\.guide-settings-card|\.page-directory|\.directory|\.spec-panel|\.checklist-stage|\.ui-spec-stage|\.prototype-state-switch)\b/;
  const phoneThemeVarPattern = /var\(--(?:app-bg|app-bg-deep|surface-[0-9]+|placeholder|border(?:-[a-z]+)?|text-(?:strong|muted|soft|subtle)|inverse-bg|inverse-text|topbar-bg|tabbar-bg|tabbar-border|tabbar-active-bg|tabbar-active-text|drawer-scrim)\)/;
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const body = match[2];
    if (!workspaceSelectorPattern.test(selector)) continue;
    if (!phoneThemeVarPattern.test(body)) continue;
    findings.push({
      line: countLinesBefore(css, match.index || 0),
      selector,
      value: body.match(phoneThemeVarPattern)?.[0] || 'phone theme variable'
    });
  }
  return findings;
}

function findPhoneWorkspaceTokenLeaks(css) {
  const findings = [];
  const phoneSelectorPattern = /(^|[\s,.#])(?:phone|statusbar|nav-bar|screen|home-|profile-|ai-video|login|carrier|global-login|sms-login|code-login|email-login|creation|member|vip|points|energy|result|template|asset|work-|tabbar|bottom-|ghost-cta|icon-btn|modal|album|component-screen|padded|banner-placeholder|avatar-placeholder|upload|tool-|chips|search-box|mini-|photo-|workflow|notice|empty-state|new-work|play-dot|card-row|grid-list|works-list|prompt|strength|record-thumb|case-cover|task-)/;
  const allowedSelectorPattern = /^\s*(?::root|\.phone\[data-theme="(?:light|dark)"\])/;
  const workspaceVarPattern = /var\(--workspace-[^)]+\)/;
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const body = match[2];
    if (!phoneSelectorPattern.test(selector)) continue;
    if (allowedSelectorPattern.test(selector)) continue;
    if (!workspaceVarPattern.test(body)) continue;
    findings.push({
      line: countLinesBefore(css, match.index || 0),
      selector,
      value: body.match(workspaceVarPattern)?.[0] || 'workspace variable'
    });
  }
  return findings;
}

const pagesRootFiles = sourceFiles
  .map((file) => toPosix(file))
  .filter((file) => /^src\/pages\/[^/]+\.jsx?$/.test(file));
const allowedPagesRootFiles = new Set(['src/pages/index.js', 'src/pages/AiToolScreens.jsx']);
const unexpectedRootPageFiles = usesLayeredArchitecture ? pagesRootFiles.filter((file) => !allowedPagesRootFiles.has(file)) : [];
const aiToolScreensPath = resolve(root, 'src/pages/AiToolScreens.jsx');
const aiToolScreensContent = pathExists('src/pages/AiToolScreens.jsx') ? readFileSync(aiToolScreensPath, 'utf8') : '';
const monolithicAiToolScreens = /function\s+\w+Screen\s*\(/.test(aiToolScreensContent) || aiToolScreensContent.split('\n').length > 20;

const requiredProjectDataFiles = [
  'src/project/meta.js',
  'src/project/design.js',
  'src/project/directory.js',
  'src/project/states.js',
  'src/project/mock-data.js',
  'src/project/routing.js',
  'src/project/notes/index.js',
  'src/project/notes/page-copy.js',
  'src/project/notes/interactions.js',
  'src/project/test-cases/index.js',
  'src/project/project-data.js'
];
const missingProjectDataFiles = usesLayeredArchitecture ? requiredProjectDataFiles.filter((filePath) => !pathExists(filePath)) : [];

const requiredLayeredArchitectureChecks = usesLayeredArchitecture ? [
  { label: 'layered app entry exists', source: main, snippet: 'src/app/App.jsx' },
  { label: 'layered framework phone frame exists', source: main, snippet: 'src/framework/PhoneFrame.jsx' },
  { label: 'layered framework spec panel exists', source: main, snippet: 'src/framework/SpecPanel.jsx' },
  { label: 'layered project data exists', source: main, snippet: 'src/project/project-data.js' },
  { label: 'layered project routes exists', source: main, snippet: 'src/project/routes.jsx' },
  { label: 'layered pages exist', source: main, snippet: 'src/pages/' },
  { label: 'layered docs exist', source: main, snippet: 'src/docs/UIDesignChecklistPage.jsx' },
  { label: 'UI checklist receives current prototype theme', source: main, snippet: '<UIDesignChecklistPage pageReadVersions={pageReadVersions} theme={theme}' },
  { label: 'UI checklist preview uses current prototype theme', source: main, snippet: 'theme={theme}' },
  { label: 'prototype ui kit entry exists', source: main, snippet: 'src/prototype-ui/components/index.jsx' }
] : [];

const requiredShellChecks = [
  ...requiredLayeredArchitectureChecks,
  { label: 'single phone shell config helper', source: main, snippet: 'getPageShellConfig' },
  { label: 'phone exposes page level', source: main, snippet: 'data-page-level' },
  { label: 'phone screen renderer map', source: main, snippet: 'renderPhoneScreen' },
  { label: 'primary viewport class in React', source: main, snippet: 'screen--primary' },
  { label: 'secondary viewport class in React', source: main, snippet: 'screen--secondary' },
  { label: 'prototype state switch scroller ref', source: main, snippet: 'stateScrollerRef' },
  { label: 'prototype state switch active button lookup', source: main, snippet: "querySelector('button.active')" },
  { label: 'prototype state switch detects overflow', source: main, snippet: 'updateOverflowState' },
  { label: 'prototype state switch centers selected chip', source: main, snippet: 'activeCenterOffset - scroller.clientWidth / 2' },
  { label: 'workspace background is isolated', source: styles, snippet: 'body,\n.app-shell' },
  { label: 'workspace background uses fixed light shell color', source: styles, snippet: '--workspace-bg: #F5F6F8;' },
  { label: 'directory and notes use fixed white panels', source: styles, snippet: '--workspace-panel: #FFFFFF;' },
  { label: 'directory and notes muted surface is light', source: styles, snippet: '--workspace-panel-muted: #F3F4F6;' },
  { label: 'dynamic framework panel height token', source: styles, snippet: '--workspace-panel-height: min(866px, calc(100dvh - var(--workspace-frame-y) * 2));' },
  { label: 'left rails use dynamic viewport height', source: styles, snippet: 'height: var(--workspace-panel-height);' },
  { label: 'notes panel uses dynamic viewport height', source: styles, snippet: '.spec-panel {\n  width: var(--workspace-notes-width);\n  height: var(--workspace-panel-height);' },
  { label: 'notes cards avoid phone theme colors', source: styles, snippet: 'background: #FFFFFF;' },
  { label: 'workspace settings rail fixed width', source: styles, snippet: '--workspace-settings-width: 210px;' },
  { label: 'workspace uses four fixed columns', source: styles, snippet: 'grid-template-columns: var(--workspace-settings-width) var(--workspace-left-width) var(--workspace-center-width) var(--workspace-notes-width);' },
  { label: 'medium-screen workspace breakpoint', source: styles, snippet: '@media (max-width: 1504px)' },
  { label: 'medium-screen keeps notes beside prototype', source: styles, snippet: '@media (max-width: 1504px)' },
  { label: 'medium-screen uses compact four columns', source: styles, snippet: 'grid-template-columns: var(--workspace-settings-width) var(--workspace-left-width) var(--workspace-center-width) var(--workspace-notes-width);' },
  { label: 'medium-screen notes stay in right column', source: styles, snippet: '.spec-panel {\n    grid-column: auto;\n    width: var(--workspace-notes-width);\n    height: var(--workspace-panel-height);' },
  { label: 'small-screen single-column workspace', source: styles, snippet: '@media (max-width: 1180px)' },
  { label: 'small-screen settings rail stacks safely', source: styles, snippet: '.project-settings-rail {\n    grid-template-columns: repeat(4, minmax(0, 1fr));' },
  { label: 'narrow-screen settings rail single column', source: styles, snippet: '@media (max-width: 680px)' },
  { label: 'phone scales on very narrow screens', source: styles, snippet: '.phone,\n  .prototype-stage-toolbar {\n    transform: scale(.92);' },
  { label: 'project settings rail exists', source: main, snippet: 'className="project-settings-rail"' },
  { label: 'Product Notes page explanation tab', source: main, snippet: "label: '页面说明'" },
  { label: 'Product Notes element inventory section', source: main, snippet: '页面元素列表' },
  { label: 'Product Notes interaction section', source: main, snippet: '交互说明' },
  { label: 'Product Notes conditionally renders state handling', source: main, snippet: '空态/失败态' },
  { label: 'Product Notes local edit button', source: main, snippet: 'className="note-edit-button"' },
  { label: 'Product Notes local edit saves through API', source: main, snippet: "fetch('/__mlp/api/notes/update'" },
  { label: 'Product Notes local edit keeps unsaved state', source: main, snippet: 'onDirtyChange?.(draftDirty)' },
  { label: 'Product Notes local edit auto clears reviewed', source: viteConfig, snippet: 'reviewed: false' },
  { label: 'Product Notes local edit API exists', source: viteConfig, snippet: "server.middlewares.use('/__mlp/api/notes/update'" },
  { label: 'Product Notes local edit hash conflict check', source: viteConfig, snippet: "'conflict'" },
  { label: 'Product Notes local edits file exists', source: main, snippet: "local-edits.json" },
  { label: 'Unsaved Product Notes page switch guard', source: main, snippet: 'confirmLeaveDirtyNotes' },
  { label: 'right panel local tab state exists', source: main, snippet: "useState('interactions')" },
  { label: 'right panel sticky top bar exists', source: main, snippet: 'className="spec-sticky-head"' },
  { label: 'right panel has three tabs', source: main, snippet: "id: 'overview', label: '页面说明'" },
  { label: 'Test Cases separate right panel', source: main, snippet: "panelMode === 'tests'" },
  { label: 'Product Notes test case styling', source: styles, snippet: '.test-case-card' },
  { label: 'hard-coded black phone shell', source: styles, snippet: 'background: #050505;' },
  { label: 'primary viewport sizing class', source: styles, snippet: '.screen--primary' },
  { label: 'secondary viewport sizing class', source: styles, snippet: '.screen--secondary' },
  { label: 'secondary status bar follows topbar', source: styles, snippet: '.phone[data-page-level="secondary"] .statusbar' },
  { label: 'direct phone page fills viewport', source: styles, snippet: '.screen > .app-page' },
  { label: 'direct phone page minimum height', source: styles, snippet: 'min-height: 100%;' },
  { label: 'theme switch is an independent card', source: main, snippet: 'className="theme-card"' },
  { label: 'directory has internal scroll area', source: main, snippet: 'className="directory-scroll"' },
  { label: 'UI specification hidden from page directory', source: main, snippet: "id: 'uiSpec', number: 'S2', label: 'UI规范说明', group: '规范/文档', level: 'docs', status: 'draft', placement: 'hidden'" },
  { label: 'directory excludes placed support pages', source: main, snippet: "supportPages.filter((page) => !existingIds.has(page.id) && !page.placement)" },
  { label: 'fixed wider Product Notes width', source: styles, snippet: '--workspace-notes-width: 546px;' },
  { label: 'left rails fixed height', source: styles, snippet: '.project-settings-rail,\n.left-rail' },
  { label: 'directory internal scroll CSS', source: styles, snippet: '.directory-scroll' },
  { label: 'connector overlay component', source: main, snippet: 'function ConnectorOverlay' },
  { label: 'connector overlay rendered behind guide switch', source: main, snippet: '<ConnectorOverlay activeInteraction={interactionGuideEnabled ? activeInteraction : null}' },
  { label: 'interaction guide state exists', source: main, snippet: 'interactionGuideEnabled' },
  { label: 'interaction guide toggle lives in settings rail', source: main, snippet: 'className="theme-card guide-settings-card"' },
  { label: 'interaction guide shortcut exists', source: main, snippet: 'handleGuideShortcut' },
  { label: 'interaction guide shortcut key is G', source: main, snippet: "event.key.toLowerCase() !== 'g'" },
  { label: 'interaction guide shortcut hint is visible', source: main, snippet: '<kbd>G</kbd>' },
  { label: 'settings use segmented toggle style', source: main, snippet: 'className="segmented-toggle"' },
  { label: 'interaction guide uses segmented toggle style', source: main, snippet: 'className="segmented-toggle guide-toggle"' },
  { label: 'right-panel mode uses internal tabs', source: main, snippet: 'className="right-panel-tabs"' },
  { label: 'interaction source data attribute', source: main, snippet: "'data-interaction-id': id" },
  { label: 'visible interaction source lookup', source: main, snippet: 'getVisibleInteractionSource' },
  { label: 'connector overlay CSS layer', source: styles, snippet: '.interaction-connector-layer' },
  { label: 'connector path CSS', source: styles, snippet: '.interaction-connector-path' },
  { label: 'connector endpoint CSS', source: styles, snippet: '.interaction-connector-dot' },
  { label: 'hard-coded light blue connector path color', source: styles, snippet: 'rgba(147, 197, 253, 0.78)' },
  { label: 'hard-coded light blue connector endpoint color', source: styles, snippet: 'rgba(147, 197, 253, 0.92)' },
  { label: 'narrow phone and state toolbar scale together', source: styles, snippet: '.phone,\n  .prototype-stage-toolbar {\n    transform: scale(.92);' },
  { label: 'narrow phone and state toolbar share origin', source: styles, snippet: 'transform-origin: top center;' }
];
const missingShellChecks = requiredShellChecks.filter((check) => !check.source.includes(check.snippet));
const workspaceThemeLeaks = findWorkspaceThemeLeaks(styles);
const phoneWorkspaceTokenLeaks = findPhoneWorkspaceTokenLeaks(styles);
const forbiddenWorkbenchInteractions = [
  { label: 'prototype state switch documented as interaction', source: main, snippet: "title: '原型状态切换'" },
  { label: 'prototype state switch documented as interaction', source: main, snippet: 'title: "原型状态切换"' },
  { label: 'prototype state switch bound to connector', source: main, snippet: "bindInteraction('prototype-state'" },
  { label: 'prototype state switch bound to connector', source: main, snippet: 'bindInteraction("prototype-state"' },
  { label: 'page state switch bound to connector', source: main, snippet: "bindInteraction(stateControlId" },
  { label: 'page state switch bound to connector', source: main, snippet: 'bindInteraction(stateControlId' }
].filter((check) => check.source.includes(check.snippet));

const forbiddenLegacyShell = [
  { label: 'Product Notes legacy guide toggle DOM', source: main, snippet: 'notes-guide-toggle' },
  { label: 'Product Notes legacy guide toggle CSS', source: styles, snippet: '.notes-guide-toggle' },
  { label: 'directory footer legacy theme placement DOM', source: main, snippet: 'directory-footer' },
  { label: 'directory footer legacy theme placement CSS', source: styles, snippet: '.directory-footer' }
].filter((check) => check.source.includes(check.snippet));

const forbiddenShellRules = [
  { label: 'primary tabbar extra bottom shell block', source: styles, snippet: '.phone:has(.tabbar)::after' }
].filter((check) => check.source.includes(check.snippet));

const forbiddenDirectoryGroups = [
  "group: '一级页面'",
  "group: '二级页面'",
  "group: 'Primary Pages'",
  "group: 'Secondary Pages'"
].filter((snippet) => main.includes(snippet));
const requiredJourneyGroups = [];
const missingJourneyGroups = requiredJourneyGroups.filter((group) => !main.includes(`group: '${group}'`));

const requiredCssRules = [
  { label: 'theme card fixed white shell surface', snippet: '.theme-card,\n.page-directory' },
  { label: 'theme card fixed compact padding', snippet: '.theme-card {\n  padding: 12px;' },
  { label: 'theme card fixed minimum height', snippet: 'min-height: 115px;' },
  { label: 'settings segmented switch fixed compact height', snippet: '.segmented-toggle {\n  width: 100%;\n  min-height: 40px;' },
  { label: 'settings segmented switch has two columns', snippet: 'grid-template-columns: repeat(2, minmax(0, 1fr));' },
  { label: 'settings segmented option styling', snippet: '.segmented-toggle button {\n  min-width: 0;\n  min-height: 32px;' },
  { label: 'settings segmented active option styling', snippet: '.segmented-toggle button.active {\n  background: #222222;\n  color: #FFFFFF;' },
  { label: 'prototype state switch fixed width', snippet: 'width: 375px;\n  min-height: 42px;\n  border-radius: var(--radius-icon);' },
  { label: 'prototype state switch transparent wrapper', snippet: 'background: transparent;\n  box-shadow: none;' },
  { label: 'prototype state switch is horizontal scroll container', snippet: 'overflow-x: auto;' },
  { label: 'prototype state switch has edge centering space', snippet: '--state-switch-edge-space: 150px;' },
  { label: 'prototype state switch uses scroll padding', snippet: 'scroll-padding-inline: var(--state-switch-edge-space);' },
  { label: 'prototype state switch hides scrollbar', snippet: '.prototype-state-switch::-webkit-scrollbar' },
  { label: 'prototype state switch chips sized to text', snippet: '.prototype-state-switch > div {\n  min-width: 0;\n  width: max-content;' },
  { label: 'prototype state switch non-overflow group centers', snippet: 'margin-inline: auto;' },
  { label: 'prototype state switch overflowing edge padding', snippet: '.prototype-state-switch.is-overflowing > div {\n  min-width: 100%;\n  padding-inline: var(--state-switch-edge-space);' },
  { label: 'prototype state switch inactive chip transparent', snippet: '.prototype-state-switch button {\n  flex: 0 0 auto;\n  min-width: 0;\n  height: 30px;\n  border: 0;\n  border-radius: var(--radius-pill);\n  background: transparent;' },
];
const missingRequiredCss = requiredCssRules.filter((rule) => !styles.includes(rule.snippet));

const pagesCssPath = resolve(root, 'src/pages/styles/pages.css');
const frameworkCssPath = resolve(root, 'src/framework/framework.css');
const rootStylesImportsPagesCss = rootStyles.includes("@import './pages/styles/pages.css';") || rootStyles.includes('@import "./pages/styles/pages.css";');
const rootStylesImportsFrameworkCss = rootStyles.includes("@import './framework/framework.css';") || rootStyles.includes('@import "./framework/framework.css";');
const pageStyleSplitFailures = [
  !pathExists('src/pages/styles/pages.css') ? '缺少 src/pages/styles/pages.css' : '',
  !pathExists('src/framework/framework.css') ? '缺少 src/framework/framework.css 完整框架样式承载层' : '',
  !rootStylesImportsFrameworkCss ? 'src/styles.css 未导入 src/framework/framework.css' : '',
  !rootStylesImportsPagesCss ? 'src/styles.css 未导入页面样式文件' : ''
].filter(Boolean);

function findCssRule(selectorNeedle) {
  let fallback = '';
  for (const match of styles.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const selectors = selector.split(',').map((item) => item.trim());
    if (selectors.includes(selectorNeedle)) return match[2];
    if (!fallback && selector.includes(selectorNeedle)) fallback = match[2];
  }
  return fallback;
}

const frameworkLayoutFindings = [
  !/display:\s*grid/.test(findCssRule('.workspace')) ? '.workspace 未实际设置 display: grid' : '',
  !/grid-template-columns:\s*var\(--workspace-settings-width\)\s+var\(--workspace-left-width\)\s+var\(--workspace-center-width\)\s+var\(--workspace-notes-width\)/.test(findCssRule('.workspace')) ? '.workspace 未使用四列固定框架宽度' : '',
  !/height:\s*var\(--workspace-panel-height\)/.test(findCssRule('.spec-panel')) ? '.spec-panel 未使用动态固定高度' : '',
  !/border:\s*0/.test(findCssRule('.directory-group button')) || !/background:\s*transparent/.test(findCssRule('.directory-group button')) ? '.directory-group button 可能退回浏览器默认按钮样式' : '',
  !/display:\s*flex|display:\s*grid/.test(findCssRule('.phone-stage')) ? '.phone-stage 未声明布局，可能无法居中手机' : ''
].filter(Boolean);

function findUndefinedLocalReferences(file, text) {
  const findings = [];
  const imported = new Set();
  const declared = new Set();
  for (const match of text.matchAll(/import\s+\{([^}]+)\}\s+from/g)) {
    for (const rawName of match[1].split(',')) {
      const name = rawName.trim().split(/\s+as\s+/).pop()?.trim();
      if (name) imported.add(name);
    }
  }
  for (const match of text.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from/g)) imported.add(match[1]);
  for (const match of text.matchAll(/(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/g)) declared.add(match[1]);
  for (const hook of ['useState', 'useEffect', 'useRef', 'useMemo']) {
    if (new RegExp(`\\b${hook}\\b`).test(text) && !imported.has(hook) && !declared.has(hook)) findings.push(`${relative(root, file)} 使用 ${hook} 但未导入/声明`);
  }
  const jsxNames = [...text.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)].map((match) => match[1]);
  const allowed = new Set(['React', 'Fragment']);
  for (const name of uniq(jsxNames)) {
    if (!allowed.has(name) && !imported.has(name) && !declared.has(name)) findings.push(`${relative(root, file)} JSX 组件 ${name} 未导入/声明`);
  }
  const functionCalls = ['getVideoStyleByState', 'getChecklistTarget', 'getStateOptions', 'getPrototypeHash'];
  for (const name of functionCalls) {
    if (new RegExp(`\\b${name}\\s*\\(`).test(text) && !imported.has(name) && !declared.has(name)) findings.push(`${relative(root, file)} 调用 ${name} 但未导入/声明`);
  }
  return findings;
}

const undefinedReferenceFindings = sourceFiles.flatMap((file) => findUndefinedLocalReferences(file, readFileSync(file, 'utf8')));

const pageCssFrameworkLeakFindings = pathExists('src/pages/styles/pages.css')
  ? (() => {
      const text = readFileSync(pagesCssPath, 'utf8');
      const forbidden = [
        ['MLP FRAMEWORK SHELL GUARDS', 'src/pages/styles/pages.css 包含框架 shell guard'],
        ['MLP STRICT FRAMEWORK GUARDS', 'src/pages/styles/pages.css 包含 strict guard'],
        ['Latest MLP framework sync', 'src/pages/styles/pages.css 包含旧框架同步块'],
        ['MLP connector final override', 'src/pages/styles/pages.css 包含连接线框架覆盖块']
      ];
      const forbiddenSelectors = [
        '.spec-panel',
        '.project-card',
        '.page-directory',
        '.checklist-stage',
        '.ui-spec-stage',
        '.phone {',
        '.statusbar',
        '.nav-bar',
        '.screen,',
        'body,',
        '.app-shell',
        '--workspace-'
      ];
      return [
        ...forbidden.filter(([needle]) => text.includes(needle)).map(([, message]) => message),
        ...forbiddenSelectors.filter((selector) => text.includes(selector)).map((selector) => `src/pages/styles/pages.css 包含框架/文档壳层选择器 ${selector}`)
      ];
    })()
  : [];

const localEditsPath = resolve(root, 'src/project/notes/local-edits.json');
const deletionResidueFailures = pathExists('src/project/notes/local-edits.json') ? (() => {
  let edits;
  try { edits = JSON.parse(readFileSync(localEditsPath, 'utf8')); } catch { return ['local-edits.json cannot be parsed for deletion residue']; }
  const searchableFiles = [...sourceFiles, ...cssFiles].filter((file) => {
    const rel = toPosix(file);
    return rel.startsWith('src/pages/') || rel.startsWith('src/project/') || rel === 'src/app/App.jsx';
  });
  const searchable = searchableFiles.map((file) => [toPosix(file), readFileSync(file, 'utf8')]);
  const failures = [];
  for (const states of Object.values(edits.elementDeletions || {})) for (const records of Object.values(states || {})) {
    for (const item of Object.values(records || {})) {
      if (!['applied', 'conflict'].includes(item?.status)) continue;
      for (const needle of [item.elementId, ...(Array.isArray(item.sourceRefs) ? item.sourceRefs : [])].filter(Boolean)) {
        for (const [file, source] of searchable) if (source.includes(needle)) failures.push(`${file} 保留已删除元素引用 ${needle}`);
      }
      if (item?.status === 'conflict') failures.push(`元素删除冲突未解决 ${item.elementId || 'unknown'}`);
    }
  }
  return failures;
})() : [];
const requiredNotesRules = [
  { label: 'manual annotation panel', source: main, snippet: 'AnnotationPanel' },
  { label: 'phone annotation layer', source: main, snippet: 'AnnotationLayer' },
  { label: 'element anchor mode', source: main, snippet: "anchorType: 'element'" },
  { label: 'coordinate anchor mode', source: main, snippet: "anchorType: 'coordinate'" },
  { label: 'one-shot annotation reset', source: main, snippet: "setAnnotationMode('preview')" },
  { label: 'single-use element add action', source: main, snippet: '添加元素标注' },
  { label: 'single-use coordinate add action', source: main, snippet: '添加坐标标注' },
  { label: 'manual annotation storage', source: viteConfig, snippet: "target === 'annotation'" },
  { label: 'annotation overlay styles', source: styles, snippet: '.annotation-layer' },
  { label: 'annotation read-only detail', source: main, snippet: 'annotation-detail' },
  { label: 'annotation explicit edit action', source: main, snippet: 'setEditing(true)' },
  { label: 'annotation discard action', source: main, snippet: 'discard' },
  { label: 'one-shot element deletion action', source: main, snippet: "'delete-element'" },
  { label: 'element deletion second confirmation', source: main, snippet: 'pendingElementDeletion' },
  { label: 'element deletion persistence bucket', source: viteConfig, snippet: 'elementDeletions' },
  { label: 'element deletion immediate hide', source: styles, snippet: '[data-mlp-element-deleted]' },
  { label: 'element deletion restore action', source: main, snippet: 'onRestoreElement' },
  { label: 'annotation creation state notice', source: main, snippet: '新增标注' },
  { label: 'static annotation bundle', source: main, snippet: 'bundledLocalEdits' },
  { label: 'annotation acceptance command', source: JSON.stringify(packageJson), snippet: 'mlp:annotation-acceptance' },
  { label: 'documentation comparable hash', source: main, snippet: 'expectedHash: sourceHash' },
  { label: 'human checked metadata', source: viteConfig, snippet: "checkedBy: 'human'" },
  { label: 'human save requires re-review', source: viteConfig, snippet: 'reviewed: false' },
  { label: 'save conflict response', source: viteConfig, snippet: "throwHttp(409, 'conflict'" },
  { label: 'failed save retains editor draft', source: main, snippet: '保存失败，修改内容已保留。' },
  { label: 'panel-local connector scrolling', source: main, snippet: "panel.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })" },
  { label: 'test case interaction ownership', source: main, snippet: 'interactionId: item.id' },
  { label: 'test case state ownership', source: main, snippet: 'stateNumber' }
];
const requiredScreenshotRules = [
  { label: 'prototype screenshot action', source: main, snippet: 'copyPrototypeScreenshot' },
  { label: 'prototype screenshot renderer', source: main, snippet: "from 'html2canvas'" },
  { label: 'prototype screenshot logical resolution', source: main, snippet: 'scale: 1' },
  { label: 'prototype screenshot fixed width', source: main, snippet: 'width: 375' },
  { label: 'prototype screenshot expands long pages', source: main, snippet: 'data-mlp-screenshot-expand' },
  { label: 'prototype screenshot removes phone frame', source: main, snippet: "borderRadius: '0'" },
  { label: 'prototype screenshot excludes annotations', source: main, snippet: "querySelector('.annotation-layer')" },
  { label: 'image clipboard write', source: main, snippet: 'new ClipboardItem' },
  { label: 'prototype screenshot dependency', source: JSON.stringify(packageJson), snippet: 'html2canvas' },
  { label: 'prototype screenshot button style', source: styles, snippet: '.prototype-copy-button' },
  { label: 'prototype screenshot button phone alignment', source: styles, snippet: '.prototype-copy-button {\n  position: absolute;\n  top: 6px;\n  left: 0;' },
  { label: 'prototype screenshot button does not cover state chips', source: styles, snippet: 'padding: 6px 46px;' }
];
const missingScreenshotRules = requiredScreenshotRules.filter((rule) => !rule.source.includes(rule.snippet));
const missingNotesRules = requiredNotesRules.filter((rule) => !rule.source.includes(rule.snippet));
const forbiddenNotesRules = [
  { label: 'editable annotation kind selector', source: main, snippet: 'setDraft({ ...draft, kind:' },
  { label: 'persistent annotation mode switch', source: main, snippet: 'annotation-mode-control' },
  { label: 'element mode coordinate fallback', source: main, snippet: "if (!target) {\n        onCreate({ anchorType: 'coordinate'" },
  { label: 'decorative annotation panel title icon', source: main, snippet: '<MessageSquareText' }
].filter((rule) => rule.source.includes(rule.snippet));
const forbiddenDocumentationRules = [
  { label: 'documentation cards use global scrollIntoView', source: main, snippet: 'scrollIntoView(' }
].filter((rule) => rule.source.includes(rule.snippet));

const reviewSteps = [
  {
    name: '页面目录拆分',
    pass: unexpectedRootPageFiles.length === 0 && !monolithicAiToolScreens && pathExists('src/pages/index.js'),
    detail: unexpectedRootPageFiles.length || monolithicAiToolScreens || !pathExists('src/pages/index.js')
      ? `根 pages 文件异常: ${unexpectedRootPageFiles.join(', ') || '无'}；AiToolScreens 大文件: ${monolithicAiToolScreens ? '是' : '否'}；index.js: ${pathExists('src/pages/index.js') ? '存在' : '缺失'}`
      : 'pages 已按目录拆分，根目录仅保留 index.js 和可选兼容 barrel'
  },
  {
    name: '项目数据分层',
    pass: missingProjectDataFiles.length === 0,
    detail: missingProjectDataFiles.length ? `缺少: ${missingProjectDataFiles.join(', ')}` : 'project 数据已按 meta/directory/states/mock-data/routing/notes/test-cases 分层'
  },
  {
    name: '页面目录用户流程分组',
    pass: forbiddenDirectoryGroups.length === 0 && missingJourneyGroups.length === 0,
    detail: forbiddenDirectoryGroups.length
      ? `目录仍使用层级组名: ${forbiddenDirectoryGroups.join(', ')}`
      : missingJourneyGroups.length
        ? `模板缺少功能模块组: ${missingJourneyGroups.join(', ')}`
        : '页面目录按用户流程排序，并按功能模块而非一二级页面分组'
  },
  {
    name: '页面状态评审覆盖',
    pass: stateChecklistCoverage.length === 0 && numberingFindings.length === 0,
    detail: stateChecklistCoverage.length || numberingFindings.length ? `UI 设计清单或编号异常: ${[...stateChecklistCoverage, ...numberingFindings].join(', ')}` : '每个真实页面状态均可评审，真实页面编号稳定且不重复'
  },
  {
    name: '自动交互文档关闭',
    pass: !generatedDocsPresent,
    detail: generatedDocsPresent ? `仍发现 ${documentedIds.length} 条预生成交互说明` : '未预填自动交互说明，使用人工标注数据'
  },
  {
    name: '可标注元素来源',
    pass: isFrameworkTemplate || isDiscovery || expectedDocumentedIds.length > 0,
    detail: expectedDocumentedIds.length ? `发现 ${expectedDocumentedIds.length} 个稳定元素锚点来源` : '空白框架模板尚无产品元素；新增页面后必须提供稳定锚点'
  },
  {
    name: '框架强约束',
    pass: missingRequiredCss.length === 0 && frameworkLayoutFindings.length === 0,
    detail: missingRequiredCss.length || frameworkLayoutFindings.length ? `缺少: ${missingRequiredCss.map((rule) => rule.label).join(', ')}；布局异常: ${frameworkLayoutFindings.join('；')}` : '工作台面板、状态切换和四栏布局规则已就位'
  },
  {
    name: 'Theme/Guide/状态切换视觉',
    pass: missingRequiredCss.filter((rule) => /theme|prototype state/i.test(rule.label)).length === 0,
    detail: missingRequiredCss.filter((rule) => /theme|prototype state/i.test(rule.label)).length
      ? `缺少: ${missingRequiredCss.filter((rule) => /theme|prototype state/i.test(rule.label)).map((rule) => rule.label).join(', ')}`
      : 'Theme、Guide 和原型状态切换壳层样式已固定'
  },
  {
    name: '手机框架结构',
    pass: missingShellChecks.length === 0,
    detail: missingShellChecks.length ? `缺少: ${missingShellChecks.map((rule) => rule.label).join(', ')}` : 'PhoneFrame、页面层级、手机壳和 viewport 结构已就位'
  },
  {
    name: '手机壳底部色块',
    pass: forbiddenShellRules.length === 0,
    detail: forbiddenShellRules.length ? `禁止项: ${forbiddenShellRules.map((rule) => rule.label).join(', ')}` : '未添加底部 Tab 额外黑色安全区'
  },
  {
    name: '框架/主题隔离',
    pass: workspaceThemeLeaks.length === 0 && phoneWorkspaceTokenLeaks.length === 0,
    detail: workspaceThemeLeaks.length || phoneWorkspaceTokenLeaks.length
      ? `${workspaceThemeLeaks.length} 处 workspace 使用 phone 主题变量，${phoneWorkspaceTokenLeaks.length} 处手机原型使用 workspace 变量`
      : 'workspace、目录、文档与手机原型主题变量已隔离'
  },
  {
    name: '状态切换隔离',
    pass: forbiddenWorkbenchInteractions.length === 0,
    detail: forbiddenWorkbenchInteractions.length ? `禁止项: ${forbiddenWorkbenchInteractions.map((item) => item.label).join(', ')}` : '原型状态切换未进入 Product Notes 交互说明或连接线'
  },
  {
    name: '旧框架入口清理',
    pass: forbiddenLegacyShell.length === 0,
    detail: forbiddenLegacyShell.length ? `禁止项: ${forbiddenLegacyShell.map((item) => item.label).join(', ')}` : '未保留旧 Product Notes 引导开关或目录底部主题入口'
  },
  {
    name: '人工标注结构',
    pass: missingNotesRules.length === 0 && forbiddenNotesRules.length === 0 && forbiddenDocumentationRules.length === 0,
    detail: missingNotesRules.length || forbiddenNotesRules.length || forbiddenDocumentationRules.length
      ? `缺少: ${missingNotesRules.map((rule) => rule.label).join(', ')}；禁止项: ${[...forbiddenNotesRules, ...forbiddenDocumentationRules].map((rule) => rule.label).join(', ')}`
      : '元素锚点、坐标锚点、本地存储、静态数据打包与标注面板均已接入'
  },
  {
    name: '原型截图复制',
    pass: missingScreenshotRules.length === 0,
    detail: missingScreenshotRules.length
      ? `缺少: ${missingScreenshotRules.map((rule) => rule.label).join(', ')}`
      : '当前手机原型可渲染为 PNG 并复制到系统剪贴板'
  },
  {
    name: '页面样式模块化',
    pass: pageStyleSplitFailures.length === 0 && pageCssFrameworkLeakFindings.length === 0,
    detail: pageStyleSplitFailures.length || pageCssFrameworkLeakFindings.length
      ? [...pageStyleSplitFailures, ...pageCssFrameworkLeakFindings].join('；')
      : '页面样式已拆到 src/pages/styles/pages.css，根 styles.css 保持轻量且不托管框架 guard'
  },
  {
    name: '静态引用完整性',
    pass: undefinedReferenceFindings.length === 0,
    detail: undefinedReferenceFindings.length ? undefinedReferenceFindings.slice(0, 12).join('；') : '未发现常见缺失 import、未定义 JSX 组件或未定义 helper 调用'
  },
  {
    name: 'PRD与固定支持入口',
    pass: missingDesignContractChecks.length === 0 && !designContractExportMissing && prdRuntimeFailures.length === 0 && lifecycleFailures.length === 0 && prdFailures.length === 0 && prdVisibilityFailures.length === 0 && fixedDirectorySupportFailures.length === 0,
    detail: missingDesignContractChecks.length || designContractExportMissing || prdRuntimeFailures.length || lifecycleFailures.length || prdFailures.length || prdVisibilityFailures.length || fixedDirectorySupportFailures.length
      ? `缺少或无效: ${[...missingDesignContractChecks, designContractExportMissing ? 'project-data design export' : '', ...prdRuntimeFailures, ...lifecycleFailures, ...prdFailures, ...prdVisibilityFailures, ...fixedDirectorySupportFailures].filter(Boolean).join(', ')}`
      : 'PRD已同步，固定支持入口完整'
  },
  {
    name: '人工删除记录清理',
    pass: deletionResidueFailures.length === 0,
    detail: deletionResidueFailures.length ? deletionResidueFailures.join('；') : '未发现已应用删除记录的源码残留'
  }
];

console.log('MLP loop review');
for (const [index, step] of reviewSteps.entries()) {
  console.log(`${index + 1}. ${step.pass ? 'PASS' : 'FAIL'} ${step.name} - ${step.detail}`);
}

if (workspaceThemeLeaks.length) {
  console.log('\nWorkspace/theme leaks:');
  for (const item of workspaceThemeLeaks.slice(0, 40)) {
    console.log(`- src/**/*.css:${item.line} ${item.selector} (${item.value})`);
  }
}

if (phoneWorkspaceTokenLeaks.length) {
  console.log('\nPhone/workspace token leaks:');
  for (const item of phoneWorkspaceTokenLeaks.slice(0, 40)) {
    console.log(`- src/**/*.css:${item.line} ${item.selector} (${item.value})`);
  }
}

if (missingShellChecks.length) {
  console.log('\nMissing shell checks:');
  for (const item of missingShellChecks) {
    console.log(`- ${item.label}`);
  }
}

if (missingProjectDataFiles.length) {
  console.log('\nMissing project data files:');
  for (const item of missingProjectDataFiles) {
    console.log(`- ${item}`);
  }
}

if (unexpectedRootPageFiles.length || monolithicAiToolScreens) {
  console.log('\nUnexpected root page files:');
  for (const item of unexpectedRootPageFiles) {
    console.log(`- ${item}`);
  }
  if (monolithicAiToolScreens) console.log('- src/pages/AiToolScreens.jsx is still a monolithic screen file');
}

if (frameworkLayoutFindings.length) {
  console.log('\nFramework layout findings:');
  for (const item of frameworkLayoutFindings) {
    console.log(`- ${item}`);
  }
}

if (undefinedReferenceFindings.length) {
  console.log('\nUndefined reference findings:');
  for (const item of undefinedReferenceFindings.slice(0, 40)) {
    console.log(`- ${item}`);
  }
}

if (reviewSteps.some((step) => !step.pass)) process.exitCode = 1;
