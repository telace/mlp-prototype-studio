# Framework Template Contract

Use this contract with `assets/framework-template/` when creating or updating mobile low-fi prototypes.

`assets/framework-template/` is the default project scaffold. It keeps the accepted workbench structure and visual system, but removes the prior project's business pages and data. It contains one sample page only, plus framework docs for UI checklist and UI spec. Include a component reference only when the project has meaningful reusable components to document.

`assets/current-workbench-template/` is a full historical example of the completed AI background prototype. Keep it as reference only. Do not use it for new project initialization unless explicitly asked.

## Project Isolation

Every prototype project must be isolated.

- One project equals one directory.
- All prototype project directories must be stored under the configured MLP project root.
- Resolve the MLP project root in this order: user-specified path for the current task, `MLP_PROJECT_ROOT` environment variable, then the default `~/Documents/Codex/mlp-projects/`.
- The canonical project path is `<MLP_PROJECT_ROOT>/<project-slug>/`. This is the only path that should be used for local preview, build, iteration, and deployment.
- Do not place project source directly in a conversation workspace or temporary chat/worktree folder. A folder such as `<workspace>/<project-slug>/` or `<workspace>/projects/<project-slug>/` is a misplaced or legacy import, not the canonical project location.
- If files arrive in a workspace-local project folder, first compare or synchronize them into `<MLP_PROJECT_ROOT>/<project-slug>/`; do not run or deploy from the misplaced workspace-local folder.
- Use a unique project slug and path for every project.
- Local preview and cloud deployment URLs must be separated by project, not by page. Example: one project uses `http://127.0.0.1:5174/` and `https://prototype.budgit.cc/video-replication/`; another project uses a different local port and cloud path.
- Do not use page-level URLs as the primary preview contract. Pages and states should normally switch inside the prototype workspace through the left directory and prototype state switch.
- Do not mix multiple products, domains, or client projects in one React app unless the user explicitly asks for a portfolio/index site.
- Do not overwrite or delete another project's files when starting a new project.
- Do not copy runtime-generated files such as `dist/`, `node_modules/`, `.npm-cache/`, Playwright logs, or deployment backups into a new project.
- Do not share mutable JS data objects across projects. New projects must have their own `project`, `pageDirectory`, page states, UI checklist, notes, and demo data.
- If a target directory already exists, treat it as protected unless it is explicitly the current active project and the user asked to modify it.

Initialization order:

1. Create or choose a unique directory under `<MLP_PROJECT_ROOT>/<project-slug>/`.
2. Scaffold from `assets/framework-template/`.
3. Update project identity only if known.
4. Run install/build or local preview setup as needed.
5. Report the local path and preview URL.
6. Wait for the user's product/page requirements before replacing template page content.

## Fixed Shell

Keep these parts visually and structurally consistent across projects unless the user explicitly asks to redesign the prototype workspace:

- Desktop review workspace: project/settings rail, page directory rail, center phone prototype, right Product Notes.
- Workbench-level fixed bottom update toast. It is hidden by default, appears only after `/version.json` changes, uses the text `原型已更新，点击刷新查看最新版本`, and refreshes the page on click. It must not auto-refresh and must not occupy the four-column workspace's vertical document flow.
- Desktop review workspace column widths: project/settings rail `210px`, page directory rail `210px`, center prototype column `431px`, right Product Notes `546px`, column gap `20px`, total width `1457px`. Do not replace these with elastic `fr`, `minmax`, or content-driven desktop widths.
- Responsive workspace behavior is part of the fixed shell contract. The shell must define `--workspace-frame-y` and `--workspace-panel-height: min(866px, calc(100dvh - var(--workspace-frame-y) * 2))`; the project/settings rail, page directory rail, and Product Notes use this dynamic height and scroll internally so small laptop screens keep a fixed bottom margin instead of overflowing. Below `1504px`, the workspace must stay in four columns with compact fixed widths, keeping Product Notes to the right of the phone. Do not move Product Notes below the prototype at this breakpoint because it creates confusing vertical ordering on small laptop screens. Below `1180px`, the workspace collapses to one column, rails become full-width/static, the directory uses internal scrolling, and the phone stage remains horizontally safe. Below `680px`, settings cards and directory rows stack to one column. Below `430px`, the phone and prototype state switch scale together. These rules must be present in the managed framework guard block so old projects do not keep stale desktop-only layouts after refresh.
- Project card position, width, visual weight, and relationship to settings. Project card lives in the first project/settings rail, not inside the page directory rail.
- Theme card, interaction guide card, and right-panel mode card position and behavior. The theme card sits below the project card in the first project/settings rail and contains the only light/dark phone theme switch. The interaction guide card contains the only `交互引导` switch. The right-panel mode card contains the only `交互说明 / 测试用例` switch. These cards use the same `210px` rail width and reuse the same `theme-card` plus `segmented-toggle` visual pattern. Each control must be a two-option segmented switch: `亮色 / 暗色`, `关闭 / 开启`, and `说明 / 用例`. Do not use a single "current value + 切换" button, and do not place these switches in the page directory footer or Product Notes panel.
- Rail scroll contract. The project/settings rail and page directory rail are fixed to the prototype/notes height on desktop. The page directory fills its own rail height and only its internal `.directory-scroll` list area scrolls; the directory title and status legend stay visible. Project card, theme card, and interaction guide card stay visible in the independent first rail.
- Page directory panel style, group style, active item style, status indicator pattern, and update badge pattern. The directory status legend must always include both `已定稿` and `调整中` instead of deriving legend items only from current page data. Page update badges are per-user unread metadata: each page can define `updatedAt` or `version`, and the browser stores the last viewed value per project and page.
- Theme switch scope. The template supports exactly `light` and `dark` grayscale themes for the phone prototype page only. The switch must not recolor the workspace shell, page directory, docs pages, prototype state switch, or Product Notes. Every project must define a default phone theme, such as `project.defaultTheme: 'light' | 'dark'`. The example template defaults to `light`, real projects may default to `dark`, and theme persistence must be project-scoped using `project.slug` so one project's theme choice does not affect another project's preview. On first open or when no saved value exists, use `project.defaultTheme`.
- Workspace shell color contract. Everything outside the phone viewport is fixed framework content: the desktop shell, left project/theme/directory cards, prototype state switch, docs pages, Product Notes, connector controls, and update toast. Keep these surfaces hard-coded to bright framework colors: `#F5F6F8` workspace background, `#FFFFFF` panels, `#F3F4F6` muted strips/cards, `#E5E7EB` borders, `#222222` primary text, and `#5F6670` muted text. Interaction note cards use `#FFFFFF`, with active/context surfaces on `#F3F4F6`. Do not use phone tokens such as `--app-bg`, `--surface-*`, `--text-strong`, or `--border` in these shell areas.
- Phone frame size and visual style, including strict `375 x 812` app viewport.
- Phone shell structure. Keep the phone shell and app viewport responsibilities explicit: the shell is fixed framework chrome with a hard-coded black/near-black frame; the viewport is the themed app UI surface. New templates should prefer separate shell/viewport structure. Existing projects may keep one `.phone` wrapper only if they keep explicit shell/page classes and preserve the black shell outside or behind the themed viewport.
- Center phone component stack. Preserve `PrototypeStage -> PhoneFrame -> statusbar -> optional BackBar -> screen viewport -> optional TabBar`. `PhoneFrame` should use a single shell config helper to decide `primary`, `secondary`, `custom`, `showBackBar`, `showTabBar`, and the screen class. Do not duplicate page hierarchy conditions across page components.
- Screen viewport classes. Primary pages must use `screen--primary`; secondary pages must use `screen--secondary`; custom tool pages may use `screen--custom` only for intentional tool canvases with custom top controls. Do not rely on selectors such as `.nav-bar + .screen` as the only source of viewport sizing.
- Phone page padding contract: every real phone page and in-phone component preview/demo page must preserve standard horizontal padding (`16px` default, `14px` only for dense tool screens). Do not allow content blocks, text, cards, lists, form rows, or component demos to touch the phone edge unless the element is an approved full-bleed structural surface such as status bar, top title bar, bottom tab bar, bottom action bar, full-screen canvas/media preview, or overlay scrim.
- Prototype-only state switch above the phone: always visible, no leading "状态" label, chips sized to text, centered. The switch wrapper and unselected chips are transparent, with no gray/framed background; only the active chip has a filled selected background. The switch scroller must reserve left/right edge-centering space with `--state-switch-edge-space`, `scroll-padding-inline`, and matching inner `padding-inline`; do not calculate only the text width, because first/last active capsules must center without clipping. Do not add custom mouse-drag behavior by default; clicking a state chip switches state and centers the active chip in the horizontal switch when the list overflows. It is a workbench viewer control, not App UI: do not bind it with `data-interaction-id`, do not draw connector lines from it, and do not list it in Product Notes interaction cards.
- Prototype state centering is required behavior, not an optional polish. `PrototypeStage` must own a state scroller ref, react to page/active-state changes, locate `button.active`, and call `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })` so long state lists keep the selected chip visible and centered.
- Product Notes panel layout, heading style, interaction note block style, hover highlight, and panel-local anchor scroll behavior. The explicit guide switch belongs to the project/settings rail, not the Product Notes panel.
- Product Notes and Test Cases structure is protected. The right panel must support two views controlled by the project/settings rail: `Product Notes` and `Test Cases`. Product Notes renders `1. 页面说明`, `2. 页面元素清单`, `3. 交互说明`, and `4. 状态/异常矩阵`. Test Cases renders a separate grouped test-case view. Test cases must not be embedded under interaction cards. Ordinary product edits may change the page data, element data, interaction content, and test content, but must not collapse the structure back into one loose interaction list or mix test cases into Product Notes.
- Product Notes anchor scroll must be panel-local and controlled by the `交互引导` switch. When the switch is off, phone hover/focus must not auto-scroll the notes panel and must not draw connector lines. When it is on, hover/focus from the phone scrolls the notes panel only, never the whole review webpage. Keep the notes panel internally scrollable with a modest max height.
- Interaction connector overlay. Keep `ConnectorOverlay` mounted at workbench level, not inside an individual phone page. Every `bindInteraction` source must set `data-interaction-id`. The overlay must draw `.interaction-connector-layer`, `.interaction-connector-path`, and `.interaction-connector-dot` only when the guide switch is on and a linked prototype element and Product Notes card are both visible. Do not treat right-panel scrolling/highlight as a substitute for the connector line. Connector colors are fixed and theme-independent: light blue `rgba(147, 197, 253, 0.78)` path and `rgba(147, 197, 253, 0.92)` dots.
- Docs page behavior for UI design checklist, UI spec, optional component library, and prompt documentation when prompts are in scope. The UI design checklist must list only real app/prototype page states that require UI output; exclude prompt pages, appendix pages, UI spec pages, and empty component library pages. The UI design checklist docs page must include a compact quantity summary based on the checklist row/page-state count, allow selecting each checklist row, and show the corresponding page/state on the right by reusing the real prototype/phone components at original ratio and size, not by rendering a scaled thumbnail, screenshot, iframe-only copy, or duplicated mockup. Hide the prototype-only state switch in this checklist preview because checklist row selection already controls the previewed state. Do not add an extra title/header bar above the right-side prototype preview. Position the preview vertically from the selected checklist row so it visually follows the selected item, but clamp the offset so the preview remains visible in the current viewport.
- Base grayscale low-fi visual system, spacing scale, radius scale, typography scale, and no-dashed-line rule.
- Phone-scoped theme variables for prototype page colors. Keep framework shell, left directory, docs, state switch, and Product Notes colors fixed and outside the theme scope. App/prototype selectors inside the phone must use phone variables only, such as `--app-bg`, `--surface-*`, `--placeholder`, `--border`, `--text-*`, `--inverse-*`, `--topbar-bg`, and `--tabbar-*`. Phone selectors must not reference `--workspace-*` variables. Do not introduce a third phone theme during ordinary project work.
- Reusable component patterns from `references/component-patterns.md`, including fixed buttons, form fields, bottom sheets, action sheets, left drawers, toasts, modals/dialogs, and shared empty/loading/error states.
- Layer interaction contract: drawers, sheets, action sheets, and modals must have a visible solid scrim/backdrop and all visible controls must be clickable. Backdrops, close icons, and cancel buttons close the layer or return to the previous state; row actions, select buttons, and confirm buttons must navigate, update state, or show feedback. Secondary-page sheets and modals must cover the phone status bar with their scrim.
- If a sheet or modal is rendered inside the scroll/content screen and cannot physically cover the phone status bar because of parent clipping or sibling stacking, add a phone-level status-bar scrim tied to the same open state. The phone-level scrim must use the same solid scrim token and close the layer when clicked.

Do not recreate these from scratch for a new project. Copy the template and edit the dynamic content areas.

For existing projects, do not copy the full template over the project. Use `references/framework-refresh.md` and patch only shared shell behavior, CSS tokens, update/version support, and reusable framework logic while preserving the existing product pages and data.

When an existing project already has designed page UI, framework sync must preserve that UI structure and migrate its styling into the latest tokenized system. Convert page-specific hard-coded colors, radii, spacing, line widths, buttons, image placeholders, bottom bars, sheets, drawers, toasts, and modals to the shared phone-scoped variables and reusable component classes. The latest `light` and `dark` phone themes must apply to existing pages after the sync. Do not replace existing screens with template demo screens just to obtain the new visual style.

## Editing Boundary

For ordinary product edits, keep the framework shell fixed and work only inside dynamic product areas.

The framework template now uses a layered source layout. Keep these ownership boundaries intact:

- `src/app/`: application assembly only.
- `src/framework/`: review workbench shell, phone frame, page directory, settings rail, Product Notes/Test Cases panel, connector overlay, update toast, and other framework-only components.
- `src/prototype-ui/`: shared phone prototype UI kit, phone-scoped tokens, and reusable component patterns.
- `src/project/`: project identity, directory/state data, routes, notes, test cases, UI checklist, prompts, and other project configuration.
- `src/pages/`: real product/prototype page screens.
- `src/docs/`: support documentation pages such as UI checklist, UI specification, and prompt docs.

`src/main.jsx` must remain a thin entry point. Do not move project data, framework components, page screens, Product Notes, or Test Cases back into `main.jsx`.

For old projects, use `scripts/migrate-project-to-layered.sh` before attempting a full split. The script performs a compatibility migration by moving the old app into `src/legacy/LegacyApp.jsx`, adding the layered folders, and verifying review/build. This is not a semantic deep split. After compatibility migration, move legacy data/screens/docs into `project/`, `pages/`, and `docs/` incrementally.

Project platform metadata lives under `.mlp/` and is part of the delivery contract, not a disposable cache:

- `.mlp/project.json`: project identity and current version.
- `.mlp/versions.json`: immutable release history using `x.x.xx` version numbers.
- `.mlp/current.json`: current version pointer.
- `.mlp/access.json`: public/password access metadata with salted hash only.
- `.mlp/releases/<version>/dist/`: immutable static build snapshots.

Do not store comments, versions, access metadata, or project-center data inside page components. These belong to the platform metadata layer.

Protected framework areas:

- Desktop workspace shell: `.app-shell`, `.workspace`, `.project-settings-rail`, `.left-rail`, project card, theme card, page directory, `directory-scroll`, `PrototypeStage`, `PhoneFrame`, `SpecPanel`, connector overlay, and update toast.
- Fixed workspace variables: project/settings rail `210px`, page directory rail `210px`, center `431px`, Product Notes `546px`, gap `20px`, total `1457px`, notes height `866px`, and both left rail heights `866px`.
- Phone shell and hierarchy: `data-page-level`, `getPageShellConfig`, `renderPhoneScreen`, `.screen--primary`, `.screen--secondary`, `.screen--custom`, black outer-ring phone shell, no extra primary-tab bottom shell layer, status bar/topbar sizing.
- Theme infrastructure: `project.defaultTheme`, `mlp-theme:<project.slug>`, phone-scoped light/dark token names, and the rule that theme switching affects only the phone viewport.
- Managed CSS blocks: `MLP FRAMEWORK SHELL GUARDS` and `MLP STRICT FRAMEWORK GUARDS`.
- Project tooling: `scripts/write-version.mjs`, `public/version.json`, `scripts/mlp-loop-review.mjs`, `npm run mlp:review`, `npm run mlp:framework-sync`, and build/prebuild scripts.
- Right-panel mode behavior: `rightPanelMode`, `notes-mode-toggle`, separate Product Notes/Test Cases rendering, and the rule that Product Notes interactions do not contain embedded test-case blocks.

Dynamic product areas:

- `project` identity values, page directory entries, page states, UI checklist rows, prompt docs, Product Notes data, interaction definitions, product demo data arrays, and page-specific screen components rendered inside the phone viewport.
- Page-specific app UI and CSS may be added only with existing phone tokens, spacing, radius, typography, button, placeholder, sheet, drawer, modal, toast, and list patterns.

Specified directory page style refresh:

- Requests such as `按 mlp 更新 <页面名> 样式` or `只更新 <页面名> 的 mlp 样式` are page-level style refreshes.
- Match the requested page by directory label, page id, page number, or group context. If the match is ambiguous, ask for clarification.
- Preserve all fixed shell areas and update only the selected page's phone UI and named page state when provided.
- Convert that selected page's stale styles to current phone-scoped tokens and reusable patterns. Do not replace the page with the framework example page.
- Run framework guard sync, `npm run mlp:review`, and `npm run build` after the page refresh.

If an ordinary product edit appears to require changing a protected framework area, stop and treat it as a framework change: update the skill/template contract first, then run the framework refresh command for affected projects.

## Initial Page Scope

New framework projects should start minimal:

- Remove prior project primary pages and secondary pages.
- Keep a minimal framework example set: one primary page example and one secondary page example. The primary page demonstrates locked bottom navigation plus actions to navigate to the secondary page and open a left drawer. The secondary page demonstrates a locked top title/back bar plus actions for bottom sheet, modal/dialog, and toast states.
- Keep framework docs pages if they are needed to preserve UI checklist and UI spec capabilities. Keep a component library only when it contains useful reusable component examples; remove it if empty.
- Keep a `组件演示` docs page only when it demonstrates reusable component combinations that are not already covered by the primary/secondary example pages. Treat this as framework documentation, not as a real product page.
- Do not carry over templates, login pages, membership pages, profile pages, result pages, or any other product-specific screens from previous projects.
- Add real primary and secondary pages only after the user describes the new product requirements.

## Dynamic Content Areas

Change these for each new product:

- `project`: name, slug, path, and short project summary shown in the project card.
- `pageDirectory`: real page list, grouping, page labels, page numbers, hierarchy, status, and page update keys such as `updatedAt` or `version`.
- Page state arrays, such as create/workbench states, profile states, result states, or feature-specific states.
- `uiDesignChecklist`: every page/state surface UI must design.
- `promptDocs`: reusable prompt assets when the prototype includes parsing, generation, model, or workflow prompts. Render prompt assets on an independent `提示词` docs page, not inside UI specification or Product Notes.
- Product data arrays: categories, templates, recommendation lists, tools, works, plans, energy packages, or other demo data.
- Page copy/spec data used by Product Notes.
- Screen components and their internal content, while keeping shared shell components and visual conventions intact.
- Component library examples when the project reuses standard framework components. Keep examples generic and token-based; do not put business-specific content in the component library.
- Route/page rendering map so the directory, phone, state switch, and notes panel stay synchronized.

## Required Data Shape

Every project should preserve these concepts, even if the object names change:

```js
const project = {
  name: 'Project Name',
  slug: 'project-slug',
  path: '/project-slug/',
  defaultTheme: 'light'
};

const pageDirectory = [
  {
    id: 'home',
    number: '1',
    label: '首页',
    group: '一级页面',
    level: 'primary',
    status: 'draft',
    updatedAt: '2026-06-22T10:00:00+08:00'
  }
];

const pageStates = [
  { id: 'default', label: '默认态' }
];

const uiDesignChecklist = [
  { number: '1-1', page: '首页', state: '默认态', status: 'draft' }
];
```

Status rules:

- `approved` means finalized and requires explicit user confirmation.
- `draft` means adjusting or not confirmed.
- `updatedAt` or `version` is a secondary page update key layered on a page item, not a page status. Store each user's viewed page update values in localStorage under a project-scoped key such as `mlp-page-read:<project.slug>`. Show a directory `更新` badge only when the current page update key differs from the locally viewed key, and mark the page as viewed when the user opens it.

## Product Notes Contract

Product Notes must update when either the page or the page state changes.

For confirmed pages, each interaction block should include:

- Component number, such as `3-1-4`.
- Component/element name.
- Purpose.
- Interaction type.
- Interaction result.
- Error, empty, loading, or permission behavior when relevant.
- Data boundary only when meaningful.

Component numbers belong in Product Notes. Do not show them in the directory or state switch. The phone UI may use invisible/stable interaction ids to support hover and anchor linkage.

Anchor behavior belongs inside `SpecPanel`: use a panel ref and adjust that panel's `scrollTop`; do not call `scrollIntoView` on interaction cards because it can move the entire review workspace.

## Editing Rules

- Preserve shell components such as `PageDirectory`, `PrototypeStage`, `PhoneFrame`, `SpecPanel`, and docs page wrappers.
- Preserve the `UpdateBanner` component, `public/version.json`, and `scripts/write-version.mjs` so deployed users can see a fixed bottom refresh prompt when the prototype updates.
- Existing project framework refresh must run `scripts/sync-framework-guards.mjs` from the skill and then `npm run mlp:review`. The guard script installs or updates the project-local review script and the managed strict CSS guard block. Do not skip this step when syncing framework updates into old projects.
- Framework sync must migrate old phone/App CSS that references `--workspace-*` variables into the corresponding phone theme variables. The review script must fail if any phone selector still uses workspace variables after sync.
- Prefer adding or replacing page-specific screen components instead of changing the shell.
- Keep CSS shell classes intact unless the user asks to redesign the whole workbench.
- Before creating page-specific UI for buttons, form fields, sheets, drawers, toasts, dialogs, or state cards, reuse the patterns defined in `references/component-patterns.md`.
- If a new reusable pattern is added during a project, add it to the project component library and keep its CSS tokenized.
- Use global CSS variables for all framework-template colors, radii, spacing tokens, and ordinary line widths. Do not hard-code one-off colors, radii, or ordinary `1px/2px` line widths outside token definitions.
- Drawers, bottom sheets, action sheets, and modals must include a solid phone-canvas scrim. On secondary pages, sheet and modal scrims must cover the phone system status bar as well as the page content. Backdrop buttons must be clickable and close the layer or return to the previous state.
- When adding a new page state, update the state switch data, the notes data, and the UI design checklist together.
- When implementing a multi-step feature flow made of real screens, add each step as a separate secondary page in `pageDirectory` and give each page its own `默认态`; do not model the whole flow as one page with several prototype-only states unless the user explicitly wants a single-page state review.
- When a project includes reusable prompt text, add a separate left-directory group named `提示词` with a docs page named `提示词`. Each prompt must render as an individual card with a title, full prompt body, and one-click copy button that copies only that prompt. Do not bury reusable prompts in `UI规范说明` or in a feature page's Product Notes.
- For long secondary screens, split the phone UI into a scrollable content area plus a locked bottom action area.
- Use the shared bottom action standard from the framework template: `mobile-scroll-with-actions` wraps the full page, `mobile-scroll-content` owns scrolling, and `bottom-action-bar` locks actions to the bottom of the phone. Use `bottom-action-bar single` for one full-width primary action, or `bottom-action-bar dual` for a 112px secondary action plus flexible primary action. Do not create new page-specific bottom button patterns unless the user explicitly asks.
- When adding a new app interaction, add its hover binding and Product Notes entry together.
- After any UI change, visually inspect every affected page and state for page padding, including component library pages and docs pages that render inside the phone. Fix edge-touching content before finalizing.
- After changes, run the production build and provide local preview by default.
