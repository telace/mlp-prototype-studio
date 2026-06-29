import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templateRoot = resolve(skillRoot, 'assets/framework-template');
const projectRoot = resolve(process.argv[2] || process.cwd());
const packagePath = resolve(projectRoot, 'package.json');
const stylesPath = resolve(projectRoot, 'src/styles.css');
const mainPath = resolve(projectRoot, 'src/main.jsx');
const pagesStylesDir = resolve(projectRoot, 'src/pages/styles');
const pagesStylesPath = resolve(pagesStylesDir, 'pages.css');
const projectScriptsDir = resolve(projectRoot, 'scripts');
const templatePrototypeUiDir = resolve(templateRoot, 'src/prototype-ui');
const projectPrototypeUiDir = resolve(projectRoot, 'src/prototype-ui');
const templateProjectTestCasesDir = resolve(templateRoot, 'src/project/test-cases');
const projectProjectTestCasesDir = resolve(projectRoot, 'src/project/test-cases');
const reviewScriptSource = resolve(templateRoot, 'scripts/mlp-loop-review.mjs');
const reviewScriptTarget = resolve(projectScriptsDir, 'mlp-loop-review.mjs');
const runtimeReviewScriptSource = resolve(templateRoot, 'scripts/mlp-runtime-review.mjs');
const runtimeReviewScriptTarget = resolve(projectScriptsDir, 'mlp-runtime-review.mjs');
const visualReviewScriptSource = resolve(templateRoot, 'scripts/mlp-visual-review.mjs');
const visualReviewScriptTarget = resolve(projectScriptsDir, 'mlp-visual-review.mjs');
const prototypeStageSource = resolve(templateRoot, 'src/framework/PrototypeStage.jsx');
const prototypeStageTarget = resolve(projectRoot, 'src/framework/PrototypeStage.jsx');
const specPanelSource = resolve(templateRoot, 'src/framework/SpecPanel.jsx');
const specPanelTarget = resolve(projectRoot, 'src/framework/SpecPanel.jsx');

if (!existsSync(packagePath) || !existsSync(stylesPath)) {
  console.error(`Not an MLP React project: ${projectRoot}`);
  process.exit(1);
}

mkdirSync(projectScriptsDir, { recursive: true });
copyFileSync(reviewScriptSource, reviewScriptTarget);
if (existsSync(runtimeReviewScriptSource)) {
  copyFileSync(runtimeReviewScriptSource, runtimeReviewScriptTarget);
}
if (existsSync(visualReviewScriptSource)) {
  copyFileSync(visualReviewScriptSource, visualReviewScriptTarget);
}
if (existsSync(prototypeStageSource) && existsSync(prototypeStageTarget)) {
  copyFileSync(prototypeStageSource, prototypeStageTarget);
}
if (existsSync(specPanelSource) && existsSync(specPanelTarget)) {
  copyFileSync(specPanelSource, specPanelTarget);
}
if (existsSync(templatePrototypeUiDir)) {
  mkdirSync(projectPrototypeUiDir, { recursive: true });
  if (templatePrototypeUiDir !== projectPrototypeUiDir) {
    cpSync(templatePrototypeUiDir, projectPrototypeUiDir, { recursive: true });
  }
}
if (existsSync(templateProjectTestCasesDir)) {
  mkdirSync(projectProjectTestCasesDir, { recursive: true });
  if (templateProjectTestCasesDir !== projectProjectTestCasesDir) {
    cpSync(templateProjectTestCasesDir, projectProjectTestCasesDir, { recursive: true });
  }
}
mkdirSync(pagesStylesDir, { recursive: true });
if (!existsSync(pagesStylesPath)) {
  writeFileSync(pagesStylesPath, '/* Project page styles live here. Keep framework shell styles in src/styles.css. */\n');
}

const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts['mlp:review'] = 'node scripts/mlp-loop-review.mjs';
packageJson.scripts['mlp:runtime-review'] = 'node scripts/mlp-runtime-review.mjs';
packageJson.scripts['mlp:visual-review'] = 'node scripts/mlp-visual-review.mjs';
packageJson.scripts['mlp:visual-snapshot'] = 'node scripts/mlp-visual-review.mjs --snapshot-only';
packageJson.scripts['mlp:fast-check'] = 'npm run mlp:review && npm run build';
packageJson.scripts['mlp:route-check'] = 'npm run mlp:fast-check && npm run mlp:runtime-review';
packageJson.scripts['mlp:acceptance'] = 'npm run mlp:route-check';
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

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const shellStart = '/* MLP FRAMEWORK SHELL GUARDS START */';
const shellEnd = '/* MLP FRAMEWORK SHELL GUARDS END */';
const guardStart = '/* MLP STRICT FRAMEWORK GUARDS START */';
const guardEnd = '/* MLP STRICT FRAMEWORK GUARDS END */';
const shellBlock = `${shellStart}
:root {
  --workspace-settings-width: 210px;
  --workspace-left-width: 210px;
  --workspace-center-width: 431px;
  --workspace-notes-width: 546px;
  --workspace-column-gap: 20px;
  --workspace-total-width: calc(var(--workspace-settings-width) + var(--workspace-left-width) + var(--workspace-center-width) + var(--workspace-notes-width) + var(--workspace-column-gap) * 3);
  --workspace-frame-y: 24px;
  --workspace-panel-height: min(866px, calc(100dvh - var(--workspace-frame-y) * 2));
  --workspace-bg: #F5F6F8;
  --workspace-text: #222222;
  --workspace-panel: #FFFFFF;
  --workspace-panel-muted: #F3F4F6;
  --workspace-panel-border: #E5E7EB;
  --workspace-panel-text: #222222;
  --workspace-panel-muted-text: #5F6670;
  --status-approved: #3B82F6;
  --status-draft: #FACC15;
  --radius-phone: 34px;
  --radius-card: 16px;
  --radius-control: 12px;
  --radius-icon: 10px;
  --radius-pill: 999px;
  --space-page-x: 16px;
  --space-section: 16px;
  --space-section-lg: 22px;
  --space-list: 10px;
  --space-inline: 8px;
  --space-card: 12px;
  --space-card-lg: 16px;
  --line: 1px solid;
}

html,
body,
#root {
  min-height: 100dvh;
  background: #F5F6F8;
}

body,
.app-shell {
  background: #F5F6F8;
  color: #222222;
}

.app-shell {
  min-height: 100dvh;
  padding: var(--workspace-frame-y);
}

.workspace {
  grid-template-columns: var(--workspace-settings-width) var(--workspace-left-width) var(--workspace-center-width) var(--workspace-notes-width);
  gap: var(--workspace-column-gap);
  width: var(--workspace-total-width);
  max-width: var(--workspace-total-width);
}

.project-settings-rail,
.left-rail {
  position: sticky;
  top: var(--workspace-frame-y);
  height: var(--workspace-panel-height);
  max-height: var(--workspace-panel-height);
  min-height: 0;
}

.project-settings-rail {
  display: grid;
  grid-auto-rows: auto;
  align-content: start;
  gap: 10px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.left-rail {
  display: block;
}

.project-settings-rail,
.theme-card,
.page-directory {
  width: var(--workspace-left-width);
  border-radius: var(--radius-control);
  background: #FFFFFF;
  color: var(--workspace-panel-text);
  box-shadow: none;
}

.theme-card {
  padding: 12px;
  display: grid;
  gap: 10px;
  min-height: 115px;
  align-content: start;
}

.project-settings-rail .eyebrow {
  color: #3A3A3A;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 400;
  text-transform: uppercase;
}

.theme-card strong {
  display: block;
  margin-top: 2px;
  color: #222222;
  font-size: 15px;
  line-height: 1.15;
  font-weight: 900;
}

.segmented-toggle {
  width: 100%;
  min-height: 40px;
  border: 1px solid #F3F4F6;
  border-radius: var(--radius-control);
  background: #F3F4F6;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  align-items: center;
  padding: 4px;
}

.segmented-toggle button {
  min-width: 0;
  min-height: 32px;
  border: 0;
  border-radius: calc(var(--radius-control) - 4px);
  background: transparent;
  color: #222222;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 6px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  font-weight: 800;
}

.segmented-toggle button.active {
  background: #222222;
  color: #FFFFFF;
}

.segmented-toggle button svg {
  flex: 0 0 auto;
}

.segmented-toggle button:not(.active) svg {
  color: #222222;
}

.prototype-state-switch {
  --state-switch-edge-space: 150px;
  width: 375px;
  min-height: 42px;
  border-radius: var(--radius-icon);
  background: transparent;
  box-shadow: none;
  padding: 6px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scroll-padding-inline: var(--state-switch-edge-space);
  scrollbar-width: none;
}

.prototype-state-switch::-webkit-scrollbar {
  display: none;
}

.prototype-state-switch > div {
  min-width: 0;
  width: max-content;
  box-sizing: border-box;
  padding-inline: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-inline: auto;
}

.prototype-state-switch.is-overflowing > div {
  min-width: 100%;
  padding-inline: var(--state-switch-edge-space);
  justify-content: flex-start;
  margin-inline: 0;
}

.prototype-state-switch button {
  flex: 0 0 auto;
  min-width: 0;
  height: 30px;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--workspace-panel-muted-text);
  padding: 0 16px;
  font-size: 12px;
  line-height: 1;
  font-weight: 800;
  cursor: pointer;
  text-align: center;
}

.prototype-state-switch button.active {
  background: var(--workspace-text);
  color: #F2F2F2;
}

.prototype-state-switch button[aria-disabled="true"] {
  cursor: default;
}

.page-directory {
  min-height: 0;
  height: 100%;
  padding: 16px 10px 10px 16px;
  display: flex;
  flex-direction: column;
}

.directory-head {
  flex: 0 0 auto;
  padding-right: 6px;
}

.directory-scroll {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0 6px 6px 0;
  scrollbar-width: thin;
}

.project-card,
.theme-card,
.page-directory,
.spec-panel,
.checklist-stage,
.ui-spec-stage {
  background: #FFFFFF;
  color: #222222;
}

.spec-panel {
  width: var(--workspace-notes-width);
  height: var(--workspace-panel-height);
  min-height: 0;
  max-height: var(--workspace-panel-height);
  overflow-y: auto;
}

.spec-head,
.spec-section {
  border-color: #E5E7EB;
}

.context-strip,
.interaction-card.active {
  background: #F3F4F6;
}

.interaction-card {
  background: #FFFFFF;
  border-color: #E5E7EB;
}

.interaction-note,
.spec-panel .eyebrow {
  color: #5F6670;
}

.notes-subsection {
  display: grid;
  gap: 8px;
}

.notes-subsection h4,
.test-case-group h4 {
  margin: 0;
  color: #222222;
  font-size: 14px;
  line-height: 1.25;
  font-weight: 900;
}

.notes-definition-list,
.element-card dl {
  display: grid;
  gap: 8px;
  margin: 0;
}

.notes-definition-list div,
.element-card dl div {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 8px;
}

.notes-definition-list dt,
.element-card dt {
  color: #5F6670;
  font-size: 12px;
  line-height: 1.45;
  font-weight: 800;
}

.notes-definition-list dd,
.element-card dd {
  margin: 0;
  color: #222222;
  font-size: 13px;
  line-height: 1.5;
}

.element-card-list,
.test-case-list {
  display: grid;
  gap: 10px;
}

.element-card,
.test-case-card {
  border: 1px solid #E5E7EB;
  border-radius: var(--radius-icon);
  background: #FFFFFF;
  padding: 12px;
}

.element-card strong,
.test-case-card strong {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  color: #222222;
  font-size: 14px;
  line-height: 1.25;
  font-weight: 900;
}

.test-case-section {
  display: grid;
  gap: 12px;
}

.test-case-group {
  display: grid;
  gap: 8px;
}

.test-case-card {
  background: #F3F4F6;
}

.test-case-card p,
.test-case-empty {
  margin: 0;
  color: #222222;
  font-size: 13px;
  line-height: 1.5;
}

.test-case-card b {
  font-weight: 900;
}

.interaction-testcases {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #E5E7EB;
  display: grid;
  gap: 8px;
}

.interaction-testcases h4 {
  margin: 0;
  color: #222222;
  font-size: 13px;
  line-height: 1.25;
  font-weight: 900;
}

.test-case-card.compact {
  border-color: #E5E7EB;
  background: #FFFFFF;
  padding: 10px;
}

.test-case-card.compact strong {
  margin-bottom: 6px;
  font-size: 12px;
}

.interaction-connector-layer {
  position: fixed;
  inset: 0;
  z-index: 30;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: visible;
}

.interaction-connector-path {
  fill: none;
  stroke: rgba(147, 197, 253, 0.78);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.interaction-connector-dot {
  fill: rgba(147, 197, 253, 0.92);
  stroke: #FFFFFF;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.phone {
  --phone-w: 375px;
  --phone-h: 812px;
  --statusbar-h: 44px;
  --navbar-h: 44px;
  --primary-tabbar-space: 88px;
  width: var(--phone-w);
  height: var(--phone-h);
  border-radius: var(--radius-phone);
  background: #050505;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 0 10px #050505;
}

.phone[data-theme="dark"] {
  --app-bg: #171A1D;
  --surface-1: #202326;
  --surface-2: #282B2E;
  --surface-3: #34373A;
  --placeholder: #5C5F61;
  --border: #33373A;
  --text-strong: #F4F4F1;
  --text-muted: #A7A9A8;
  --text-soft: #D5D6D3;
  --text-subtle: #B9BBB9;
  --inverse-bg: #F4F4F1;
  --inverse-text: #111111;
  --action-primary-text: #FFFFFF;
  --topbar-bg: #202326;
  --tabbar-bg: #202326;
  --tabbar-border: #303437;
  --tabbar-active-bg: #F4F4F1;
  --tabbar-active-text: #111111;
  --drawer-scrim: #111111;
}

.phone[data-theme="light"] {
  --app-bg: #F6F7F8;
  --surface-1: #FFFFFF;
  --surface-2: #EEF0F2;
  --surface-3: #E1E4E8;
  --placeholder: #B7BDC5;
  --border: #E0E3E7;
  --text-strong: #1F2328;
  --text-muted: #667085;
  --text-soft: #4B5563;
  --text-subtle: #667085;
  --inverse-bg: #1F2328;
  --inverse-text: #FFFFFF;
  --action-primary-text: #FFFFFF;
  --topbar-bg: #FFFFFF;
  --tabbar-bg: #FFFFFF;
  --tabbar-border: #E1E4E8;
  --tabbar-active-bg: #1F2328;
  --tabbar-active-text: #FFFFFF;
  --drawer-scrim: #1F2328;
}

.phone[data-theme] {
  background: #050505;
  color: var(--text-strong);
}

.statusbar {
  position: relative;
  z-index: 3;
  height: var(--statusbar-h, 44px);
}

.nav-bar {
  position: relative;
  z-index: 3;
  height: var(--navbar-h, 44px);
}

.screen {
  position: relative;
  z-index: 0;
  height: calc(var(--phone-h, 812px) - var(--statusbar-h, 44px));
}

.screen--primary {
  padding-bottom: var(--primary-tabbar-space, 88px);
}

.screen--secondary {
  height: calc(var(--phone-h, 812px) - var(--statusbar-h, 44px) - var(--navbar-h, 44px));
  padding-bottom: 0;
}

.screen--custom {
  height: calc(var(--phone-h, 812px) - var(--statusbar-h, 44px));
  padding-bottom: 0;
}

.phone[data-theme] .statusbar,
.phone[data-theme] .screen,
.phone[data-theme] .home-screen,
.phone[data-theme] .profile-screen,
.phone[data-theme] .ai-video-screen,
.phone[data-theme] .login-screen,
.phone[data-theme] .component-screen,
.phone[data-theme] .padded,
.phone[data-theme] .creation-screen-wrap,
.phone[data-theme] .creation-workbench,
.phone[data-theme] .member-center-screen,
.phone[data-theme] .points-center-screen,
.phone[data-theme] .result-screen {
  background: var(--surface-2);
  color: var(--text-strong);
}

.phone[data-theme] .nav-bar,
.phone[data-page-level="secondary"] .statusbar {
  background: var(--topbar-bg);
}

@media (max-width: 1504px) {
  :root {
    --workspace-settings-width: 190px;
    --workspace-left-width: 190px;
    --workspace-center-width: 407px;
    --workspace-notes-width: 490px;
    --workspace-column-gap: 14px;
    --workspace-total-width: calc(var(--workspace-settings-width) + var(--workspace-left-width) + var(--workspace-center-width) + var(--workspace-notes-width) + var(--workspace-column-gap) * 3);
    --workspace-frame-y: 18px;
  }

  .app-shell {
    padding: var(--workspace-frame-y);
  }

  .workspace {
    grid-template-columns: var(--workspace-settings-width) var(--workspace-left-width) var(--workspace-center-width) var(--workspace-notes-width);
    gap: var(--workspace-column-gap);
    width: var(--workspace-total-width);
    max-width: calc(100vw - 36px);
  }

  .spec-panel {
    grid-column: auto;
    width: var(--workspace-notes-width);
    height: var(--workspace-panel-height);
    min-height: 0;
    max-height: var(--workspace-panel-height);
  }
}

@media (max-width: 1180px) {
  :root {
    --workspace-frame-y: 14px;
    --workspace-panel-height: min(866px, calc(100dvh - var(--workspace-frame-y) * 2));
  }

  .app-shell {
    padding: var(--workspace-frame-y);
  }

  .workspace {
    grid-template-columns: 1fr;
    width: 100%;
    max-width: 100%;
    justify-items: stretch;
  }

  .project-settings-rail,
  .left-rail {
    position: static;
    width: 100%;
    height: auto;
    max-height: none;
  }

  .project-settings-rail {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: none;
  }

  .project-card,
  .theme-card,
  .page-directory {
    width: 100%;
  }

  .page-directory {
    height: auto;
    max-height: var(--workspace-panel-height);
  }

  .directory-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .directory-group-title {
    grid-column: 1 / -1;
  }

  .phone-stage {
    width: 100%;
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 4px;
  }

  .spec-panel {
    grid-column: auto;
    width: 100%;
    height: var(--workspace-panel-height);
    min-height: 0;
    max-height: var(--workspace-panel-height);
  }

  .checklist-stage {
    width: 100%;
    min-height: auto;
  }
}

@media (max-width: 680px) {
  .project-settings-rail {
    grid-template-columns: 1fr;
  }

  .directory-group {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 430px) {
  .phone-stage {
    overflow-x: visible;
  }

  .phone,
  .prototype-state-switch {
    transform: scale(.92);
    transform-origin: top center;
  }

  .phone {
    margin-bottom: -62px;
  }
}
${shellEnd}`;
const guardBlock = `${guardStart}
.phone[data-theme] :is(h1, h2, h3, h4, p, strong, em, b, label, input, textarea) {
  color: inherit;
}

.phone[data-theme] :is(input, textarea) {
  color: var(--text-strong);
  caret-color: var(--text-strong);
}

.phone[data-theme] .tabbar {
  left: 12px;
  right: 12px;
  bottom: 10px;
  height: 64px;
  padding: 6px 8px;
  border-radius: 24px;
  background: var(--tabbar-bg);
  border: var(--line) var(--tabbar-border);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
}

.phone[data-theme] .tabbar button {
  min-width: 0;
  min-height: 52px;
  gap: 4px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 15px;
  font-weight: 800;
}

.phone[data-theme] .tabbar button svg {
  width: 30px;
  height: 30px;
  padding: 6px;
  border-radius: 10px;
  background: transparent;
  color: currentColor;
  box-sizing: border-box;
  flex: 0 0 30px;
}

.phone[data-theme] .tabbar .active {
  background: transparent;
  color: var(--text-strong);
}

.phone[data-theme] .tabbar .active svg {
  background: var(--tabbar-active-bg);
  color: var(--tabbar-active-text);
}

.phone[data-theme] :is(.home-head span, .home-feed-head span, .profile-head span, .result-box span, .global-login-heading span, .sms-login-title span, .login-method-option em, .login-method-policy, .login-code-hint, .carrier-phone em, .carrier-phone span, .agreement-row span, .member-hero-copy p, .member-note, .points-balance-card span, .points-record-list span, .ai-video-summary, .creation-hint, .prompt-placeholder, .muted, .upload-box span, .task-primary span, .vip-title-copy em, .vip-card p, .points-block-head span, .work-item em) {
  color: var(--text-muted);
}

.phone[data-theme] :is(.home-head strong, .home-feed-head strong, .profile-head strong, .component-section h3, .global-login-heading strong, .sms-login-title strong, .login-method-option strong, .carrier-phone strong, .member-hero-copy strong, .points-balance-card strong, .asset-history-head h3, .list-head, .result-box.full strong, .vip-title-copy strong, .profile-section-head strong, .points-block-head strong, .work-item strong) {
  color: var(--text-strong);
}

.phone[data-theme] :is(.home-template-card, .template-card, .ai-video-template, .creation-case-strip button, .work-item, .asset-card, .photo-card, .tool-card, .mini-item, .member-plan-list button, .energy-package-list button, .points-record-list button) {
  color: var(--text-strong);
}

.phone[data-theme] :is(.home-template-card strong, .template-card strong, .ai-video-template strong, .creation-case-strip strong, .work-item strong, .asset-card strong, .photo-card strong, .tool-card strong, .mini-item strong, .member-plan-list strong, .energy-package-list strong, .points-record-list strong) {
  color: var(--text-strong);
}

.phone[data-theme] :is(.login-method-option, .login-method-option.primary, .settings-icon-entry, .vip-benefit-grid span, .member-benefit-copy span, .member-plan-list b) {
  background: var(--surface-2);
  color: var(--text-strong);
  border: var(--line) var(--border);
}

.phone[data-theme] :is(.carrier-primary, .works-tabs button.active) {
  background: var(--inverse-bg);
  color: var(--inverse-text);
  border-color: var(--inverse-bg);
}

.phone[data-theme] .login-method-option > span {
  background: var(--surface-3);
  color: var(--text-strong);
}

.phone[data-theme] :is(.member-hero-large, .member-bg-visual, .member-bg-visual::after) {
  background: var(--surface-3);
  color: var(--text-strong);
}

.phone[data-theme] .member-hero-copy {
  color: var(--text-strong);
}

.phone[data-theme] .member-hero-copy .eyebrow {
  background: var(--inverse-bg);
  color: var(--inverse-text);
}
${guardEnd}`;

const styles = readFileSync(stylesPath, 'utf8');
const removeLegacyRule = (source, selector) => {
  const pattern = new RegExp(`(^|\\n)${escapeRegExp(selector)}\\s*\\{[^{}]*\\}\\s*`, 'g');
  return source.replace(pattern, '\n');
};
const removeRulesContainingSelector = (source, selector) => {
  const pattern = /(?:^|\n)([^{}]+)\{[^{}]*\}\s*/g;
  return source.replace(pattern, (rule, selectorText) => {
    const selectors = selectorText.split(',').map((item) => item.trim());
    return selectors.includes(selector) ? '\n' : rule;
  });
};
const migratePhoneWorkspaceTokens = (source) => {
  const phoneSelectorPattern = /(^|[\s,.#])(?:phone|statusbar|nav-bar|screen|home-|profile-|ai-video|login|carrier|global-login|sms-login|code-login|email-login|creation|member|vip|points|energy|result|template|asset|work-|tabbar|bottom-|ghost-cta|icon-btn|modal|album|component-screen|padded|banner-placeholder|avatar-placeholder|upload|tool-|chips|search-box|mini-|photo-|workflow|notice|empty-state|new-work|play-dot|card-row|grid-list|works-list|prompt|strength|record-thumb|case-cover|task-)/;
  const allowedSelectorPattern = /^\s*(?::root|\.phone\[data-theme="(?:light|dark)"\])/;
  const replacements = [
    [/var\(--workspace-bg\)/g, 'var(--app-bg)'],
    [/var\(--workspace-panel\)/g, 'var(--surface-1)'],
    [/var\(--workspace-panel-muted\)/g, 'var(--surface-2)'],
    [/var\(--workspace-panel-border\)/g, 'var(--border)'],
    [/var\(--workspace-panel-text\)/g, 'var(--text-strong)'],
    [/var\(--workspace-panel-muted-text\)/g, 'var(--text-muted)'],
    [/var\(--workspace-text\)/g, 'var(--text-strong)']
  ];
  return source.replace(/([^{}]+)\{([^{}]*)\}/g, (rule, selectorText, body) => {
    const selector = selectorText.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!phoneSelectorPattern.test(selector) || allowedSelectorPattern.test(selector)) return rule;
    let nextBody = body;
    for (const [pattern, replacement] of replacements) {
      nextBody = nextBody.replace(pattern, replacement);
    }
    return `${selectorText}{${nextBody}}`;
  });
};
const legacyFrameworkSelectors = [
  '.theme-toggle',
  '.theme-toggle span',
  '.theme-toggle em',
  '.theme-toggle svg',
  '.segmented-toggle',
  '.segmented-toggle button',
  '.segmented-toggle button.active',
  '.segmented-toggle button svg',
  '.segmented-toggle button:not(.active) svg',
  '.prototype-state-switch',
  '.prototype-state-switch > div',
  '.prototype-state-switch button',
  '.prototype-state-switch button.active',
  '.prototype-state-switch button[aria-disabled="true"]',
  '.notes-guide-toggle',
  '.notes-guide-toggle div',
  '.notes-guide-toggle strong',
  '.notes-guide-toggle span',
  '.notes-guide-toggle button',
  '.notes-guide-toggle button.active',
  '.directory-footer',
  '.phone:has(.tabbar)::after'
];
const ensurePrototypeUiImports = (source) => {
  const imports = [
    "@import './prototype-ui/tokens.css';",
    "@import './prototype-ui/patterns.css';",
    "@import './pages/styles/pages.css';"
  ];
  const withoutExisting = source
    .replace(/@import\s+['"]\.\/prototype-ui\/tokens\.css['"];\s*/g, '')
    .replace(/@import\s+['"]\.\/prototype-ui\/patterns\.css['"];\s*/g, '')
    .replace(/@import\s+['"]\.\/pages\/styles\/pages\.css['"];\s*/g, '')
    .trimStart();
  return `${imports.join('\n')}\n\n${withoutExisting}`;
};
const normalizedStyles = ensurePrototypeUiImports(migratePhoneWorkspaceTokens(legacyFrameworkSelectors.reduce((source, selector) => {
  return removeRulesContainingSelector(removeLegacyRule(source, selector), selector);
}, styles))
  .replace(/\n\.directory-footer,\s*(?=\n\.phone\[data-theme="dark"\])/g, '\n')
  .replace(/\n\.notes-guide-toggle,\s*(?=\n\.phone\[data-theme="dark"\])/g, '\n'));
const replaceManagedBlock = (source, start, end, block) => {
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, 'g');
  return `${source.replace(pattern, '').trimEnd()}\n\n${block}\n`;
};
const withShellGuard = replaceManagedBlock(normalizedStyles, shellStart, shellEnd, shellBlock);
const nextStyles = replaceManagedBlock(withShellGuard, guardStart, guardEnd, guardBlock);
writeFileSync(stylesPath, nextStyles);

console.log(`Synced MLP framework patch guards into ${projectRoot}`);
console.log('- scripts/mlp-loop-review.mjs');
console.log('- scripts/mlp-runtime-review.mjs');
console.log('- scripts/mlp-visual-review.mjs');
console.log('- src/prototype-ui shared components');
console.log('- src/project/test-cases shared builders');
console.log('- src/pages/styles/pages.css page style module');
console.log('- package.json script: mlp:review');
console.log('- package.json script: mlp:runtime-review');
console.log('- package.json script: mlp:visual-review');
console.log('- package.json script: mlp:acceptance');
console.log('- package.json script: mlp:framework-sync -> complete framework sync');
console.log('- package.json script: mlp:framework-patch -> guard patch sync');
console.log('- package.json script: mlp:migrate-full');
console.log('- package.json script: mlp:split-modules');
console.log('- src/styles.css framework shell guard block');
console.log('- src/styles.css strict framework guard block');
