import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mainPath = resolve(root, 'src/main.jsx');
const stylesPath = resolve(root, 'src/styles.css');
const srcRoot = resolve(root, 'src');
const packagePath = resolve(root, 'package.json');
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
const usesLayeredArchitecture = sourceFiles.some((file) => relative(root, file) === 'src/app/App.jsx');
const main = sourceFiles
  .map((file) => `\n/* ${relative(root, file)} */\n${readFileSync(file, 'utf8')}`)
  .join('\n');
const styles = cssFiles
  .map((file) => `\n/* ${relative(root, file)} */\n${readFileSync(file, 'utf8')}`)
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
const isFrameworkTemplate = packageJson.name === 'mobile-lowfi-framework-template';

const uniq = (items) => [...new Set(items)].filter(Boolean).sort();
const countLinesBefore = (text, index) => text.slice(0, index).split('\n').length;

function extractBoundIds(source) {
  const ids = [];
  for (const match of source.matchAll(/bind(?:Interaction|Element)\(([^)]*)\)/g)) {
    for (const id of match[1].matchAll(/['"`]([^'"`]+)['"`]/g)) {
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

const expectedDocumentedIds = uniq([...extractBoundIds(main), ...dynamicSourceIds]);
const documentedIds = extractDocumentedIds(main);

const missingNotes = expectedDocumentedIds.filter((id) => !documentedIds.includes(id));
const missingSource = documentedIds.filter((id) => !expectedDocumentedIds.includes(id));

function findStyleFindings(css) {
  const checks = [
    { level: 'error', label: 'dashed border', regex: /border[^;\n]*dashed/gi },
    { level: 'error', label: 'decorative gradient', regex: /gradient\(/gi },
    { level: 'error', label: 'blur/backdrop effect', regex: /(backdrop-filter|filter:\s*blur|blur\()/gi },
    { level: 'warn', label: 'hard-coded off-token blue outside connector', regex: /#(?:1D4ED8|2563EB|2F80ED|3B82F6|60A5FA)\b/gi }
  ];

  return checks.flatMap((check) => {
    const findings = [];
    for (const match of css.matchAll(check.regex)) {
      const line = countLinesBefore(css, match.index || 0);
      const context = css.slice(Math.max(0, (match.index || 0) - 90), (match.index || 0) + 160);
      if (check.label.includes('blue') && context.includes('interaction-connector')) continue;
      if (check.label.includes('blue') && context.includes('status-dot')) continue;
      if (check.label.includes('blue') && context.includes('--status-approved')) continue;
      findings.push({ ...check, line, value: match[0] });
    }
    return findings;
  });
}

function findHardcodedAppColors(css) {
  const colorPattern = /(?:#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))/g;
  const phoneSelectorPattern = /(^|[\s,.#])(?:phone|statusbar|nav-bar|screen|home-|profile-|ai-video|login|carrier|global-login|sms-login|code-login|email-login|creation|member|vip|points|energy|result|template|asset|work-|tabbar|bottom-|ghost-cta|icon-btn|modal|album|component-screen|padded|banner-placeholder|avatar-placeholder|upload|tool-|chips|search-box|mini-|photo-|workflow|notice|empty-state|new-work|play-dot|card-row|grid-list|works-list|prompt|strength|record-thumb|case-cover|task-)/;
  const excludedSelectorPattern = /^(?:\s*:root|\s*body|\s*button|\s*\*|\s*\.app-shell|\s*\.workspace|\s*\.project-settings-rail|\s*\.left-rail|\s*\.project-card|\s*\.page-directory|\s*\.directory|\s*\.spec|\s*\.checklist|\s*\.ui-|\s*\.theme-toggle|\s*\.segmented-toggle|\s*\.update-banner|\s*\.interaction|\s*\.status-dot)/;
  const allowedContextPattern = /phone\[data-theme=|MLP STRICT FRAMEWORK GUARDS|var\(|rgba\(0,\s*0,\s*0,\s*0\)|rgba\(16,\s*46,\s*96/;
  const findings = [];

  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const body = match[2];
    if (!phoneSelectorPattern.test(selector) || excludedSelectorPattern.test(selector)) continue;
    if (selector === '.phone') continue;
    if (selector === '.phone[data-theme]') continue;
    if (selector.includes('.phone[data-theme="')) continue;

    for (const declaration of body.split(';')) {
      if (!colorPattern.test(declaration)) {
        colorPattern.lastIndex = 0;
        continue;
      }
      colorPattern.lastIndex = 0;
      const normalized = declaration.trim();
      if (!normalized || allowedContextPattern.test(`${selector} { ${normalized} }`)) continue;
      findings.push({
        line: countLinesBefore(css, (match.index || 0) + match[0].indexOf(declaration)),
        selector,
        value: normalized
      });
    }
  }

  return findings;
}

const styleFindings = findStyleFindings(styles);
const styleErrors = styleFindings.filter((finding) => finding.level === 'error');
const styleWarnings = styleFindings.filter((finding) => finding.level === 'warn');
const hardcodedAppColors = findHardcodedAppColors(styles);

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
  .map((file) => relative(root, file))
  .filter((file) => /^src\/pages\/[^/]+\.jsx?$/.test(file));
const allowedPagesRootFiles = new Set(['src/pages/index.js', 'src/pages/AiToolScreens.jsx']);
const unexpectedRootPageFiles = usesLayeredArchitecture ? pagesRootFiles.filter((file) => !allowedPagesRootFiles.has(file)) : [];
const aiToolScreensPath = resolve(root, 'src/pages/AiToolScreens.jsx');
const aiToolScreensContent = pathExists('src/pages/AiToolScreens.jsx') ? readFileSync(aiToolScreensPath, 'utf8') : '';
const monolithicAiToolScreens = /function\s+\w+Screen\s*\(/.test(aiToolScreensContent) || aiToolScreensContent.split('\n').length > 20;

const requiredProjectDataFiles = [
  'src/project/meta.js',
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
  { label: 'prototype state switch centers selected chip', source: main, snippet: "scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })" },
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
  { label: 'phone scales on very narrow screens', source: styles, snippet: '.phone,\n  .prototype-state-switch {\n    transform: scale(.92);' },
  { label: 'project settings rail exists', source: main, snippet: 'className="project-settings-rail"' },
  { label: 'Product Notes page explanation section', source: main, snippet: '1. 页面说明' },
  { label: 'Product Notes element inventory section', source: main, snippet: '2. 页面元素清单' },
  { label: 'Product Notes interaction section', source: main, snippet: '3. 交互说明' },
  { label: 'Product Notes state exception matrix', source: main, snippet: '4. 状态/异常矩阵' },
  { label: 'right panel mode state exists', source: main, snippet: 'rightPanelMode' },
  { label: 'right panel mode toggle lives in settings rail', source: main, snippet: 'notes-mode-toggle' },
  { label: 'Test Cases separate right panel', source: main, snippet: "rightPanelMode === 'tests'" },
  { label: 'Product Notes test case styling', source: styles, snippet: '.test-case-card' },
  { label: 'hard-coded black phone shell', source: styles, snippet: 'background: #050505;' },
  { label: 'primary viewport sizing class', source: styles, snippet: '.screen--primary' },
  { label: 'secondary viewport sizing class', source: styles, snippet: '.screen--secondary' },
  { label: 'secondary status bar follows topbar', source: styles, snippet: '.phone[data-page-level="secondary"] .statusbar' },
  { label: 'theme switch is an independent card', source: main, snippet: 'className="theme-card"' },
  { label: 'directory has internal scroll area', source: main, snippet: 'className="directory-scroll"' },
  { label: 'fixed wider Product Notes width', source: styles, snippet: '--workspace-notes-width: 546px;' },
  { label: 'left rails fixed height', source: styles, snippet: '.project-settings-rail,\n.left-rail' },
  { label: 'directory internal scroll CSS', source: styles, snippet: '.directory-scroll' },
  { label: 'connector overlay component', source: main, snippet: 'function ConnectorOverlay' },
  { label: 'connector overlay rendered behind guide switch', source: main, snippet: '<ConnectorOverlay activeInteraction={interactionGuideEnabled ? activeInteraction : null}' },
  { label: 'interaction guide state exists', source: main, snippet: 'interactionGuideEnabled' },
  { label: 'interaction guide toggle lives in settings rail', source: main, snippet: 'className="theme-card guide-settings-card"' },
  { label: 'settings use segmented toggle style', source: main, snippet: 'className="segmented-toggle"' },
  { label: 'interaction guide uses segmented toggle style', source: main, snippet: 'className="segmented-toggle guide-toggle"' },
  { label: 'right-panel mode uses segmented toggle style', source: main, snippet: 'className="segmented-toggle notes-mode-toggle"' },
  { label: 'interaction source data attribute', source: main, snippet: "'data-interaction-id': id" },
  { label: 'visible interaction source lookup', source: main, snippet: 'getVisibleInteractionSource' },
  { label: 'connector overlay CSS layer', source: styles, snippet: '.interaction-connector-layer' },
  { label: 'connector path CSS', source: styles, snippet: '.interaction-connector-path' },
  { label: 'connector endpoint CSS', source: styles, snippet: '.interaction-connector-dot' },
  { label: 'hard-coded light blue connector path color', source: styles, snippet: 'rgba(147, 197, 253, 0.78)' },
  { label: 'hard-coded light blue connector endpoint color', source: styles, snippet: 'rgba(147, 197, 253, 0.92)' }
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
  { label: 'prototype state switch chips sized to text', snippet: '.prototype-state-switch > div {\n  min-width: 100%;\n  width: max-content;' },
  { label: 'prototype state switch inner edge padding', snippet: 'padding-inline: var(--state-switch-edge-space);' },
  { label: 'prototype state switch inner avoids edge clipping', snippet: 'justify-content: flex-start;' },
  { label: 'prototype state switch inactive chip transparent', snippet: '.prototype-state-switch button {\n  flex: 0 0 auto;\n  min-width: 0;\n  height: 30px;\n  border: 0;\n  border-radius: var(--radius-pill);\n  background: transparent;' },
  { label: 'phone theme text inheritance guard', snippet: '.phone[data-theme] :is(h1, h2, h3, h4, p, strong, em, b, label, input, textarea)' },
  { label: 'tokenized floating tabbar', snippet: '.phone[data-theme] .tabbar' },
  { label: 'tabbar active label uses readable theme text', snippet: 'color: var(--text-strong);' },
  { label: 'tabbar icon has fixed 30px block', snippet: 'flex: 0 0 30px;' },
  { label: 'tabbar active icon uses inverse token', snippet: 'background: var(--tabbar-active-bg);' },
  { label: 'theme-safe template/card titles', snippet: '.phone[data-theme] :is(.home-template-card, .template-card, .ai-video-template' },
  { label: 'theme-safe login/member controls', snippet: '.phone[data-theme] :is(.login-method-option, .login-method-option.primary, .settings-icon-entry' },
  { label: 'theme-safe member hero surfaces', snippet: '.phone[data-theme] :is(.member-hero-large, .member-bg-visual, .member-bg-visual::after)' }
];
const missingRequiredCss = requiredCssRules.filter((rule) => !styles.includes(rule.snippet));

const pagesCssPath = resolve(root, 'src/pages/styles/pages.css');
const frameworkCssPath = resolve(root, 'src/framework/framework.css');
const stylesLineCount = rootStyles.split('\n').length;
const rootStylesImportsPagesCss = rootStyles.includes("@import './pages/styles/pages.css';") || rootStyles.includes('@import "./pages/styles/pages.css";');
const rootStylesImportsFrameworkCss = rootStyles.includes("@import './framework/framework.css';") || rootStyles.includes('@import "./framework/framework.css";');
const pageStyleSplitFailures = [
  !pathExists('src/pages/styles/pages.css') ? '缺少 src/pages/styles/pages.css' : '',
  !pathExists('src/framework/framework.css') ? '缺少 src/framework/framework.css 完整框架样式承载层' : '',
  !rootStylesImportsFrameworkCss ? 'src/styles.css 未导入 src/framework/framework.css' : '',
  !rootStylesImportsPagesCss ? 'src/styles.css 未导入页面样式文件' : '',
  !isFrameworkTemplate && stylesLineCount > 1800 ? `src/styles.css 仍过重: ${stylesLineCount} 行` : ''
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

const pageSourceFiles = sourceFiles.filter((file) => relative(root, file).startsWith('src/pages/') && ['.js', '.jsx'].includes(extname(file)));
const broadImportFindings = pageSourceFiles.flatMap((file) => {
  const text = readFileSync(file, 'utf8');
  const findings = [];
  for (const match of text.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g)) {
    const names = match[1].split(',').map((name) => name.trim()).filter(Boolean);
    if (names.length > 12) {
      findings.push(`${relative(root, file)} 从 lucide-react 一次导入 ${names.length} 个图标`);
    }
  }
  for (const match of text.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"][^'"]*project-data\.js['"]/g)) {
    const names = match[1].split(',').map((name) => name.trim()).filter(Boolean);
    if (names.length > 8) {
      findings.push(`${relative(root, file)} 从 project-data 一次导入 ${names.length} 个数据项`);
    }
  }
  return findings;
});

const rawOverlayFindings = pageSourceFiles.flatMap((file) => {
  const text = readFileSync(file, 'utf8');
  const forbidden = [
    'className="modal-layer"',
    'className="prototype-modal"',
    'className="login-modal-backdrop"',
    'className="login-modal',
    'className="album-backdrop"'
  ];
  return forbidden
    .filter((snippet) => text.includes(snippet))
    .map((snippet) => `${relative(root, file)} 保留旧手写弹层 ${snippet}`);
});

const legacyOverlayCssFindings = cssFiles.flatMap((file) => {
  const rel = relative(root, file);
  const text = readFileSync(file, 'utf8');
  if (rel === 'src/prototype-ui/patterns.css') return [];
  const forbiddenSelectors = [
    '.album-backdrop',
    '.login-modal-backdrop',
    '.login-modal',
    '.modal-layer',
    '.modal-backdrop',
    '.prototype-modal',
    '.modal-actions'
  ];
  return forbiddenSelectors
    .filter((selector) => text.includes(selector))
    .map((selector) => `${rel} 保留旧弹层 CSS 选择器 ${selector}`);
});

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

const prototypeUiUsageFindings = [];

const requiredNotesRules = [
  { label: 'project test case builder module', source: main, snippet: 'src/project/test-cases/index.js' },
  { label: 'state-specific interaction resolver', source: main, snippet: 'resolvePageStateInteractions' },
  { label: 'current state id supports state/stateId', source: main, snippet: "ctx.state || ctx.stateId || 'default'" },
  { label: 'per-interaction test case builder', source: main, snippet: 'export const buildInteractionTestCases = (item, index, stateNumber, ctx) => {' },
  { label: 'test cases carry interaction id', source: main, snippet: 'interactionId: item.id' },
  { label: 'functional test case group', source: main, snippet: "group: '功能测试'" },
  { label: 'boundary test case group', source: main, snippet: "group: '边界测试'" },
  { label: 'exception test case group', source: main, snippet: "group: '异常测试'" },
  { label: 'permission test case group', source: main, snippet: "group: '权限测试'" },
  { label: 'tracking test case group', source: main, snippet: "group: '埋点测试'" },
  { label: 'test cases rendered as separate panel', source: main, snippet: '<aside className="spec-panel testcases-panel"' },
  { label: 'test cases rendered per interaction element', source: main, snippet: 'testcase-interaction-card' },
  { label: 'test cases reuse connector anchor ids', source: main, snippet: 'id={`interaction-${item.id}`}' },
  { label: 'test case cards expose interaction ids', source: main, snippet: 'data-interaction-id={testCase.interactionId}' },
  { label: 'test cases built from current state interactions', source: main, snippet: 'buildInteractionTestCases(item, index, stateNumber, ctx)' },
  { label: 'test case compact card style', source: styles, snippet: '.test-case-card.compact' }
];
const missingNotesRules = requiredNotesRules.filter((rule) => !rule.source.includes(rule.snippet));
const forbiddenNotesRules = [
  { label: 'test cases embedded inside interaction card', source: main, snippet: '<div className="interaction-testcases">' },
  { label: 'test cases redundant intro copy', source: main, snippet: '测试用例按当前页面状态和交互元素生成' },
  { label: 'test cases redundant inner heading', source: main, snippet: '<h3>Test Cases</h3>' }
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
    name: '交互说明覆盖',
    pass: missingNotes.length === 0,
    detail: missingNotes.length ? `缺少 Product Notes: ${missingNotes.join(', ')}` : `已覆盖 ${documentedIds.length} 个说明 ID`
  },
  {
    name: '元素连接来源',
    pass: missingSource.length === 0,
    detail: missingSource.length ? `说明无来源元素: ${missingSource.join(', ')}` : `已匹配 ${expectedDocumentedIds.length} 个连接来源`
  },
  {
    name: 'UI 异常扫描',
    pass: styleErrors.length === 0,
    detail: styleErrors.length ? `${styleErrors.length} 个阻断项` : '未发现虚线、渐变、毛玻璃/模糊等阻断项'
  },
  {
    name: '框架强约束',
    pass: missingRequiredCss.length === 0 && frameworkLayoutFindings.length === 0,
    detail: missingRequiredCss.length || frameworkLayoutFindings.length ? `缺少: ${missingRequiredCss.map((rule) => rule.label).join(', ')}；布局异常: ${frameworkLayoutFindings.join('；')}` : '底部 Tab、主题文本、图标块和四栏布局规则已就位'
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
    name: '交互测试用例结构',
    pass: missingNotesRules.length === 0 && forbiddenNotesRules.length === 0,
    detail: missingNotesRules.length || forbiddenNotesRules.length
      ? `缺少: ${missingNotesRules.map((rule) => rule.label).join(', ')}；禁止项: ${forbiddenNotesRules.map((rule) => rule.label).join(', ')}`
      : '测试用例已从交互说明中拆分为右侧独立面板'
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
    name: '业务页组件化',
    pass: rawOverlayFindings.length === 0 && legacyOverlayCssFindings.length === 0 && prototypeUiUsageFindings.length === 0,
    detail: rawOverlayFindings.length || legacyOverlayCssFindings.length || prototypeUiUsageFindings.length
      ? [...rawOverlayFindings, ...legacyOverlayCssFindings, ...prototypeUiUsageFindings].join('；')
      : '业务页未保留旧手写 Modal/Sheet，CSS 无旧弹层残留，并按 prototype-ui 组件模式复用'
  },
  {
    name: '页面导入精简',
    pass: broadImportFindings.length === 0,
    detail: broadImportFindings.length ? broadImportFindings.join('；') : '页面导入已按实际使用精简'
  },
  {
    name: 'App 配色 token 化',
    pass: hardcodedAppColors.length === 0,
    detail: hardcodedAppColors.length ? `${hardcodedAppColors.length} 处 App 原型内部硬编码色值` : '手机 App 原型内部配色已使用全局变量'
  }
];

console.log('MLP loop review');
for (const [index, step] of reviewSteps.entries()) {
  console.log(`${index + 1}. ${step.pass ? 'PASS' : 'FAIL'} ${step.name} - ${step.detail}`);
}

if (styleWarnings.length) {
  console.log('\nWarnings:');
  for (const warning of styleWarnings) {
    console.log(`- ${warning.label}: src/**/*.css:${warning.line} (${warning.value})`);
  }
}

if (styleErrors.length) {
  console.log('\nStyle errors:');
  for (const error of styleErrors) {
    console.log(`- ${error.label}: src/**/*.css:${error.line} (${error.value})`);
  }
}

if (hardcodedAppColors.length) {
  console.log('\nHard-coded app colors:');
  for (const item of hardcodedAppColors.slice(0, 40)) {
    console.log(`- src/**/*.css:${item.line} ${item.selector} (${item.value})`);
  }
  if (hardcodedAppColors.length > 40) {
    console.log(`- ... ${hardcodedAppColors.length - 40} more`);
  }
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

if (
  missingNotes.length ||
  missingSource.length ||
  styleErrors.length ||
  missingRequiredCss.length ||
  missingNotesRules.length ||
  forbiddenNotesRules.length ||
  pageStyleSplitFailures.length ||
  pageCssFrameworkLeakFindings.length ||
  rawOverlayFindings.length ||
  legacyOverlayCssFindings.length ||
  prototypeUiUsageFindings.length ||
  broadImportFindings.length ||
  missingShellChecks.length ||
  missingProjectDataFiles.length ||
  unexpectedRootPageFiles.length ||
  monolithicAiToolScreens ||
  !pathExists('src/pages/index.js') ||
  workspaceThemeLeaks.length ||
  phoneWorkspaceTokenLeaks.length ||
  forbiddenWorkbenchInteractions.length ||
  forbiddenLegacyShell.length ||
  forbiddenShellRules.length ||
  frameworkLayoutFindings.length ||
  undefinedReferenceFindings.length ||
  hardcodedAppColors.length
) {
  process.exitCode = 1;
}
