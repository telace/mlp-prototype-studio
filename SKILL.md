---
name: mobile-lowfi-prototype
description: Build reusable mobile C-end product-manager workflows from natural-language requirements into low-fidelity clickable web prototypes, staged product notes after design confirmation, optional documents, and static deployments. Alias: mlp. Use when the user asks to create, modify, review, or deploy a mobile app low-fi prototype, says "mlp", especially for C-end product flows, prototype iteration, AI image/video editing apps, homepage/product flows, or prototypes to share with UI/development teams.
---

# Mobile Low-fi Prototype

Alias: `mlp`. When the user says `mlp`, treat it as this `mobile-lowfi-prototype` workflow and apply all project structure, template, preview, documentation, and deployment rules in this skill.

## Core Workflow

Treat the user's requirement as the source of truth. Build iteratively:

1. If the user starts a new prototype project, initialize a new isolated project from `assets/framework-template/` first. Do not design business pages in the same step unless the user explicitly provides requirements and asks to proceed.
2. Clarify only blocking product questions; otherwise make reasonable PM assumptions.
3. Start with layout and clickable prototype design. Before the user explicitly confirms that the overall prototype or specific pages are design-complete, do not spend tokens generating detailed product notes, PRDs, or exhaustive interaction documentation.
4. During the design stage, focus on page structure, visual hierarchy, reusable components, navigation, and clickable flows.
5. When the user explicitly says the whole prototype is complete, or that specific pages are complete, then generate detailed product notes for only the confirmed scope.
6. After design confirmation, structure the confirmed scope into user flows, field rules, states, permissions, analytics, acceptance criteria, and detailed interaction notes.
7. Verify the prototype in a real browser, including key clicks and responsive fit.
8. If requested, build static files and deploy to the configured Nginx site.

## Design Confirmation Gate

Use a two-stage workflow:

- **Design stage:** Build and iterate the low-fidelity prototype layout. Keep the right-side product notes minimal or placeholder-level if needed for orientation. Do not produce full PRD-style content, exhaustive field rules, analytics, or detailed exception matrices yet.
- **Confirmed documentation stage:** Only after the user explicitly confirms that the entire prototype or named pages are complete, add detailed product notes and interaction documentation for that confirmed scope.
- The user may confirm partial completion, such as "首页完成" or "登录页完成". In that case, document only those pages and keep unfinished pages in design-stage mode.
- If the user continues giving layout/design feedback, assume the design is not complete and continue prototype iteration without expanding documentation.
- Do not infer completion from silence, approval of a single small change, or deployment. Wait for explicit confirmation from the user.
- Page status labels in the prototype directory must follow the same confirmation rule. Mark a page as "approved/finalized" only after the user explicitly confirms that page is finalized. Pages that are still being explored or have not been confirmed should remain "in progress/adjusting". Treat "has updates" as a secondary badge layered on top of the main status, not as a peer status alongside approved/adjusting.

## Prototype Contract

Each prototype must include:

- A project name and stable project slug.
- A left-side page directory for quick navigation between prototype pages.
- A clear distinction between primary pages and secondary pages.
- A stable numbering system for pages, page states, and UI components.
- A real mobile canvas, not an arbitrary web card.
- Clickable page transitions for the core flow.
- A persistent right-side product notes panel on desktop.
- A non-blocking global update toast for deployed prototypes. The toast text must be `原型已更新，点击刷新查看最新版本`, and clicking it refreshes the page.
- A reusable low-fi component library page only when the project has meaningful reusable components to document and will continue iterating. Do not keep an empty component library page.
- A login page for C-end apps unless the user explicitly excludes authentication. If the product has domestic and overseas markets, split login into independent `国内登录` and `海外登录` pages instead of mixing all methods on one page.
- Domestic login should default to one-tap phone authorization when requested or appropriate, with SMS verification as an alternate path inside the same domestic login flow.
- Overseas login should use email verification and Google login when requested or appropriate.
- Template/category selectors should switch content in place. If there are more categories than fit horizontally, implement horizontal scrolling rather than wrapping or navigating away.
- Product notes for confirmed pages must be structured for研发和测试, not as loose prose. Use this fixed order:
  - `Product Notes`
  - `1. 页面说明`
  - `2. 页面元素清单`
  - `3. 交互说明`
  - `4. 状态/异常矩阵`
  - `Test Cases` 作为右侧独立视图，不嵌入交互卡片
  - `1. 功能测试`
  - `2. 边界测试`
  - `3. 异常测试`
  - `4. 权限测试`
  - `5. 埋点测试`
- Do not generate a Markdown PRD by default during design iteration. Generate a PRD only when the user explicitly asks for one or confirms the relevant scope is design-complete and still wants a separate document.
- At the end of the left-side directory, include a UI design checklist section that lists only real prototype page/state surfaces the designer needs to produce. Do not include prompt pages, appendix pages, UI spec pages, empty component library pages, or other supporting documentation pages in the UI design checklist. The UI design checklist page itself must support selecting a checklist row, showing the corresponding page/state preview on the right, and showing a compact quantity summary. The summary should count checklist rows/page states, meaning if the checklist contains 18 rows, the statistic shows 18.

## Default Prototype Page Structure

Use this desktop review layout unless the user asks for a different container:

- **Workspace shell:** A four-column review workspace in this order: `项目信息+设置 / 页面目录 / 原型 / 交互文档`. Keep the center phone as the primary focus, but keep project metadata/settings separate from page navigation.
- **Update toast:** Add a workbench-level update toast as a fixed, bottom-centered overlay. It is hidden by default and appears only when the deployed `/version.json` differs from the version loaded by the current page. It must not sit inside the four-column vertical document flow, phone canvas, left directory, or Product Notes. It should visually behave like a toast, lock to the viewport bottom, and use a z-index above the workspace, phone overlays, and connector lines.
- **Workspace fixed widths:** On desktop, the review workspace must use fixed column widths: project/settings rail `210px`, page directory rail `210px`, center prototype column `431px`, right Product Notes `546px`, with `20px` gaps. The total desktop workspace width is `1457px`. Do not use elastic `fr` or `minmax` widths for these four columns. Only collapse to one column at the mobile/tablet breakpoint.
- **Small-screen workspace adaptation:** The fixed four-column desktop layout must have framework-level responsive guards. The shell must define a dynamic panel-height token such as `--workspace-panel-height: min(866px, calc(100dvh - var(--workspace-frame-y) * 2))`. On desktop and small laptops, the project/settings rail, page directory rail, and Product Notes panel use this dynamic height and scroll internally so their bottom edge keeps a fixed distance from the browser bottom. Below `1504px`, keep all four columns in one row but switch to compact fixed widths so Product Notes remains to the right of the phone instead of dropping below it. Below `1180px`, collapse the workspace to one column, make the project/settings rail and page directory full width, and keep the phone stage horizontally safe. Below `680px`, stack settings cards and directory items to one column. Below `430px`, scale the phone and state switch together. These responsive rules belong in `sync-framework-guards.mjs`, not only in project-local CSS, so old projects receive the same behavior after framework refresh.
- **Project/settings rail:** Put project card, theme card, interaction guide card, and right-panel mode card in an independent first column named `project-settings-rail`. It should contain project name, short positioning/path, status summary when useful, the only light/dark phone theme switch, the `交互引导` switch, and the `交互说明 / 测试用例` right-panel switch. These three setting controls must use the same two-option segmented interaction style: Theme is `亮色 / 暗色`, Guide is `关闭 / 开启`, and Panel is `说明 / 用例`. Each segmented control uses a fixed two-column shell with the selected option filled; do not use a single "current value + 切换" button. Do not place project/theme/guide/right-panel switches inside the page directory column or Product Notes panel.
- **Theme card:** Put the light/dark prototype theme switch in its own compact card inside the project/settings rail. Do not place the theme switch inside the page directory footer. Any other workbench switch in this rail, such as `交互引导`, should match this card/button style unless the user explicitly asks for a different control.
- **Left directory:** List real pages/screens only. Group by Primary Pages, Secondary Pages, and Docs/Components when useful. Follow the directory visual and status rules in `references/visual-standard.md`. Do not list page states as independent pages.
- **Workspace shell color:** Everything outside the phone viewport is framework content: workspace shell, project/settings rail, page directory, prototype state switch, Product Notes, UI checklist, UI spec, component docs, connector controls, and update toast. Hard-code the non-phone framework shell to a bright light scheme: workspace background `#F5F6F8`, project/theme/directory/Product Notes/docs panels `#FFFFFF`, muted document strips/cards `#F3F4F6`, borders `#E5E7EB`, primary text `#222222`, and muted text `#5F6670`. These shell colors are not phone theme tokens and must not change when switching the phone prototype between light and dark.
- **Prototype theme switch:** The theme switch button only changes the phone prototype page colors, not the workspace shell, left directory, prototype state switch, docs pages, or Product Notes. Support exactly two phone UI themes, `light` and `dark`, managed by phone-scoped CSS variables. All app/prototype UI inside the phone must use phone theme variables such as `--app-bg`, `--surface-*`, `--placeholder`, `--border`, `--text-*`, `--inverse-*`, `--topbar-bg`, and `--tabbar-*`. Phone App selectors must not reference `--workspace-*` variables. Each project must define its own `project.defaultTheme` as either `light` or `dark`; the scaffolded example defaults to `light`, but real projects may default to `dark` when the product direction needs it. Persist the user's selected theme per project using the project slug, not a shared global browser key, so different prototype projects can keep different theme choices. On first open or when no saved value exists, use `project.defaultTheme`.
- **Directory scrolling:** The project/settings rail and page directory rail must keep a fixed desktop height aligned with the prototype/notes area. The page directory column contains only the directory card. The page directory card has a fixed height, with only the page list area scrolling internally; the directory header and status legend remain visible.
- **Directory status:** Show page review status in the directory with small indicators. The directory legend must always show both `已定稿` and `调整中`, even if the current project has pages in only one status. Only mark "final/approved" after explicit user confirmation. Treat "updated" as a secondary badge, not as a peer state in the legend. Directory update badges must support per-page unread state: each page may define `updatedAt` or `version`, the browser stores the last viewed value per project and page, and the directory shows `更新` only when the current value differs from the user's local viewed value.
- **Center prototype:** Show a persistent prototype-only state switch above the phone for every page. Remove the leading "状态" label; show only compact state chips sized to their text. The state switch wrapper and unselected chips must be transparent, with no gray/framed background; only the active chip uses a filled selected background. The horizontal scroller must include explicit left/right edge centering space, such as `--state-switch-edge-space`, `scroll-padding-inline`, and matching inner `padding-inline`, so the first and last active capsule can center without being clipped. If the page has one state, still show one `默认态` chip. Do not add custom mouse-drag behavior to the state switch by default. Clicking a state chip must switch states, and after selection the active chip should scroll into the horizontal center of the state switch when there are more states than fit.
- **State switch centering behavior:** `PrototypeStage` must keep a ref to the state chip scroller and, whenever the page or active state changes, find `button.active` and call `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`. This behavior is part of the framework shell, must be in the template, and must be checked by `mlp:review`.
- **Phone canvas:** Use a strict mobile app viewport inside a visible phone shell. The phone shell must be visually distinct from the surrounding workspace. Keep the shell structure explicit: a phone shell owns only the hard-coded black outer frame, radius, and clipping; the app viewport owns the `375 x 812` page content and phone-scoped theme variables. Do not add a separate black bottom safe-area block behind primary tab bars. If a project uses a single `.phone` element for compatibility, it must still expose clear shell/page classes and keep the black shell visible only as the outer ring.
- **Phone screen structure:** Central phone rendering must be componentized as `PrototypeStage -> PhoneFrame -> statusbar -> optional BackBar -> screen viewport -> optional TabBar`. Compute page hierarchy through a single shell config helper, not scattered conditions. Primary pages use `screen--primary` and locked bottom tabs; secondary pages use `screen--secondary`, a locked top title/back bar, and no bottom tabs; custom creation/tool pages may use `screen--custom` only when they intentionally own their own top controls.
- **Framework example pages:** The base framework template must include at least one primary page example and one secondary page example. The primary example must show a locked bottom tab bar and include actions that navigate to the secondary example or open a left drawer. The secondary example must show a locked top title/back bar, must not show bottom tabs, and must include actions that trigger bottom sheet, modal/dialog, and toast component states. Drawer, sheet, modal, and toast examples must be genuinely clickable: backdrop/close/cancel controls close or return to the prior state; select/confirm controls navigate, update state, or show feedback. Do not leave any visible layer button as a no-op.
- **Phone-level layer scrim:** On secondary pages, bottom sheet and modal/dialog scrims must cover the whole phone canvas, including the `44px` system status bar. If the layer is rendered inside `.screen` or another clipped content area and cannot physically cover the status bar, add a phone-level status-bar scrim tied to the same open state. It must use the same solid scrim token, sit above the status bar, and close or return state when tapped.
- **Existing project framework sync:** When syncing an existing MLP project to the latest framework, preserve its business pages, page states, notes, prompts, UI checklist data, and navigation logic. Patch shell behavior, shared components, CSS variables, fixed bottom update toast, and framework-level interactions in place. If the project already has page UI, migrate page-specific colors, radii, spacing, line widths, buttons, image placeholders, bottom bars, sheets, drawers, toasts, and modals to the latest phone-scoped tokens and reusable component patterns instead of replacing the page UI with the example template. The `light` and `dark` theme switch must work on existing page UI after migration; hard-coded page colors are allowed only while intentionally converting them to variables in the same change.
- **Framework change source of truth:** Any framework-level visual or behavioral change must update three places in the same change: `assets/framework-template/`, `scripts/sync-framework-guards.mjs`, and `assets/framework-template/scripts/mlp-loop-review.mjs`. Updating only `SKILL.md` or reference docs is not enough because old projects are refreshed through the sync script. The guard script must hard-code protected shell details such as Theme/Guide cards, prototype state switch, workspace columns, Product Notes structure, connector overlay, update toast, phone shell, and bottom tab rules; `mlp:review` must fail when those protected details drift.
- **Right notes:** Show Product Notes on the right. Notes must switch with both page and page state and follow the visual rules in `references/visual-standard.md`. The explicit `交互引导` switch lives in the far-left project/settings rail. When the switch is off, do not auto-scroll anchors and do not draw connector lines. When the switch is on, hovering or focusing a documented phone interaction should scroll only the notes panel to the matching block, highlight it, and draw a connector from the element to the matching Product Notes block. Anchor scrolling must affect only the notes panel, not the whole review webpage. During design iteration, keep notes lightweight; after confirmation, expand into detailed interaction docs.
- **Product Notes and Test Cases structure:** For every confirmed page state, the right panel has two switchable views controlled from the far-left project/settings rail. `Product Notes` contains only `1. 页面说明`, `2. 页面元素清单`, `3. 交互说明`, and `4. 状态/异常矩阵`. `Test Cases` is a separate right-side view and must not be embedded inside interaction cards. Test cases should include applicable functional, boundary, exception, permission, and tracking tests. The interaction details are mainly for研发和测试 and must include: basic operation, interaction result, whether the element involves user upload/input, upload/input type and boundary, whether backend APIs are needed, whether the element is required, exception handling, data boundary, permission logic, tracking recommendation, and acceptance criteria when relevant.
- **Interaction connector overlay:** The connector must be a real rendered overlay component, not only hover highlighting. Keep a `ConnectorOverlay` mounted at the workbench level, bind every source element with `data-interaction-id`, and render `.interaction-connector-layer`, `.interaction-connector-path`, and `.interaction-connector-dot` elements when the `交互引导` switch is on and a source/card pair is visible. Connector colors are hard-coded framework colors, not phone tokens and not theme-dependent: path `rgba(147, 197, 253, 0.78)`, dots `rgba(147, 197, 253, 0.92)`. Framework sync/review must fail if the connector DOM, source data attributes, guide switch, or hard-coded connector colors are missing.
- **Docs pages:** Put UI design checklist and UI specification as separate directory pages near the end. When a docs page is selected, it may replace the phone canvas instead of showing an app screen. The UI design checklist page must be interactive: each checklist row is selectable, the selected row has an obvious active state, and the right side renders the matching prototype page/state by reusing the same phone/prototype components as the main canvas. The checklist page must include a compact page quantity summary near the top, derived from the project/page/checklist data rather than hard-coded counts when possible. Do not use static screenshots, duplicated mock markup, iframe-only copies, or scaled-down previews for checklist previews. The preview must preserve the original phone/prototype ratio and size unless the user explicitly asks for a thumbnail view. Because the selected checklist row already determines the previewed state, the checklist preview must hide the prototype-only state switch above the phone. Do not add an extra title/header bar above the right-side prototype preview; the selected checklist row already identifies the page and state. Position the right-side preview vertically according to the selected checklist row so the preview visually follows the selected item, but clamp the offset to the visible viewport so the preview is not pushed below the screen.
- **Prompt docs:** When a prototype contains reusable prompts, model prompts, parsing prompts, generation prompts, or other text assets meant for PM/algorithm/development reuse, create an independent left-directory group named `提示词` with a docs page named `提示词`. Do not hide prompt assets inside `UI规范说明` or a feature page's right-side Product Notes. The prompt page must list each prompt as its own card and provide a one-click copy button for each full prompt. When a video prototype has multiple video styles, keep a generic/no-theme prompt card first, then maintain style-specific prompt cards for the styles that need specialized parsing behavior, such as commerce/product, fashion, talking-head, story, beauty/persona, and dance. Do not delete the generic/no-theme prompt when adding style-specific prompts.
- **No Markdown PRD by default:** Do not keep or regenerate a separate PRD page unless the user asks for it.

Recommended default page set for an AI image/video C-end app:

- Home: primary page with bottom navigation.
- Create/Workbench: usually a secondary creation surface if entered from bottom tab, with states such as default, unstarted, template-only, or selected tool mode.
- AI video/template production: secondary page with template selection first, then photo picker/upload after the user taps create.
- Work/detail/result: secondary page with states such as generating, completed, and failed.
- Profile: primary page with logged-out, logged-in non-member, and member states.
- Login: secondary page. If the project distinguishes domestic and overseas users, create two secondary pages under a `登录流程` directory group: `国内登录` and `海外登录`. If unspecified, ask only if authentication is central, otherwise choose the simplest conventional option.
- Member center and energy/credit center when the product has paid usage, energy, or membership.
- UI design checklist and UI specification pages for long-running prototype projects. Add a component library only when it contains meaningful reusable components; remove it if it is empty or not useful.
- Prompt documentation page when the project includes reusable prompt text. Put it under its own `提示词` directory group rather than under `规范/文档` when the prompts are product/AI-operation assets instead of UI design rules.

## Visual Standard

Use the low-fidelity visual standard in `references/visual-standard.md`.
Use the reusable component patterns in `references/component-patterns.md` when adding fixed buttons, form fields, bottom sheets, action sheets, left drawers, toasts, modals/dialogs, and shared state components.

Key rules:

- Use a strict mobile viewport, default `375 x 812`.
- Keep the phone shell and app viewport responsibilities separated. The app viewport is the real prototype surface; the phone shell is framework chrome and remains hard-coded black/near-black. Light/dark prototype themes must recolor only app content, never the phone shell.
- Do not use dashed wireframe boxes.
- Use black/white/gray low-fidelity styling. Avoid colorful accent colors unless the user explicitly asks for color.
- Support two phone-prototype grayscale themes, `light` and `dark`. These themes only affect the mobile app page inside the phone frame. Each project must have a default theme setting, such as `project.defaultTheme: 'light' | 'dark'`. The framework example defaults to `light`; each real project may set `light` or `dark` based on product needs and may remember the user's selected theme independently through a project-scoped storage key.
- Use the fixed color, typography, spacing, radius, and button tokens in `references/visual-standard.md`. Treat them as constraints, not suggestions.
- Use solid grayscale blocks with different depths to express hierarchy. Avoid semi-transparent fills and decorative effects.
- Use the typography scale in `references/visual-standard.md`; do not invent one-off font sizes or scale fonts with viewport width.
- For secondary feature pages, keep mobile page titles around `18px`, compact card titles around `15px`, module titles around `13-14px`, and helper text around `11-12px` unless the surrounding design clearly requires otherwise.
- Use homepage hero/banner areas as reusable grayscale Banner image placeholder components: a plain solid block only, with no text inside the placeholder.
- Use grayscale block placeholders for template cover images. Do not write text on template covers; show the template title below the cover. If the template is a video, add a video/play icon overlay on the cover.
- Image placeholders must follow `references/visual-standard.md`: template/material covers use `3:4`, history thumbnails use `1:1`, banners use a plain solid block, covers use `12px` radius, large previews/banners use `16px` radius, no dashed outlines, no text inside covers, and only a small play icon is allowed for video covers.
- Do not wrap double-column feeds, template grids, result actions, bottom actions, login inputs, or plan selectors in extra outer cards unless the container itself is a meaningful product component.
- Keep low fidelity: no real photos, no polished final UI styling, no decorative gradients.

When adding or modifying UI:

- First choose the closest existing component or tokenized pattern from the template.
- If a new component is required, first check `references/component-patterns.md`; if the pattern exists there, reuse it. If it does not exist, build it from the fixed visual tokens in `references/visual-standard.md` and add it to the component library only when it will be reused.
- Do not introduce new colors, radii, shadows, font sizes, or spacing scales unless the user explicitly approves a new visual direction.
- After changes, scan CSS for off-standard colors, semi-transparent values, gradients, dashed borders, one-off font sizes/radii, and page-level styles that override standard phone page padding.
- After every prototype UI change, inspect every affected phone page and every affected page state for standard horizontal padding. Real app pages, component library pages, and in-phone preview/demo pages must not let text, cards, buttons, lists, or component sections touch the phone edge unless the component is intentionally full-bleed, such as a system status bar, top title bar, bottom tab bar, locked bottom action area, full-screen canvas, drawer scrim, modal scrim, or media preview explicitly specified as full-bleed.
- After every prototype UI change, run the project's loop review script when available, usually `npm run mlp:review`. The review must check that every `bindInteraction` source has a matching Product Notes interaction id, every Product Notes interaction has a source element or declared dynamic source, the CSS has no obvious low-fi violations such as dashed wireframes, gradients, blur/backdrop effects, or unsupported off-token accent colors, every phone/App prototype selector uses global phone theme tokens rather than hard-coded color values, and phone/App selectors do not reference `--workspace-*` variables. Workspace shell colors, phone outer shell hard-coded black, directory colors, Product Notes colors, status indicator colors, update toast colors, connector colors, and `:root` theme token definitions are allowed exceptions.
- If the loop review fails, fix the missing interaction docs, missing connector source, or UI anomaly before handing off. Do not mark a page or state as documentation-complete until the review passes for the affected project.
- Update the UI spec page in the prototype when a new reusable UI pattern is intentionally added.

## Implementation Guidance

Prefer React/Vite unless the user explicitly asks for another stack. Use a data-driven page map when possible so page notes stay synchronized with page changes.

## Layered Project Architecture

MLP projects should use a layered source layout so the framework can evolve without rewriting each project's prototype pages:

```text
src/
├── main.jsx
├── app/
│   └── App.jsx
├── framework/
│   ├── Workbench / rail / directory / phone / notes components
│   ├── ConnectorOverlay.jsx
│   ├── UpdateBanner.jsx
│   └── framework.css
├── prototype-ui/
│   ├── components/
│   ├── tokens.css
│   └── patterns.css
├── project/
│   ├── project-data.js
│   ├── routes.jsx
│   ├── directory/state/content/docs data
│   └── project.css
├── pages/
│   └── product page screens
└── docs/
    └── UI checklist, UI spec, prompt docs
```

Layer responsibilities:

- `framework/`: owns the review workspace shell, project/settings rail, page directory, prototype stage, phone frame, Product Notes/Test Cases panel, connector overlay, update toast, and other non-phone workbench behavior. Framework refresh may update this layer.
- `prototype-ui/`: owns reusable phone-prototype UI primitives such as buttons, inputs, cards, tabs, bottom actions, sheets, modals, toasts, placeholders, and phone-scoped tokens. UI-kit refresh may update this layer, but ordinary page edits should only call these components.
- `project/`: owns project identity, page directory, states, routes, Product Notes data, Test Cases data, UI checklist data, prompt data, and product-specific configuration.
- `pages/`: owns product page layout/content only. Pages should compose reusable `prototype-ui` components and project data; they should not define framework shell behavior.
- `docs/`: owns documentation pages rendered as workbench support pages, not real app screens.

`src/main.jsx` should stay minimal: import global CSS, render `App`, and avoid holding project data, page UI, framework components, Product Notes, or Test Cases inline.

Framework updates must avoid touching `pages/` and `project/` unless the task is explicitly a product-content migration. Product edits must avoid touching `framework/` unless the user explicitly asks to change the MLP framework.

### Legacy Project Layered Migration

Old MLP projects may still use the historical `src/main.jsx + src/styles.css` structure. Do not manually split a mature project inline during ordinary product edits. Use the safe migration script first:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/migrate-project-to-layered.sh <project-slug-or-absolute-path>
```

The migration script is intentionally conservative:

- Creates a sibling backup folder named `<project>.backup.layered-<timestamp>` before editing.
- Moves the old `src/main.jsx` implementation into `src/legacy/LegacyApp.jsx`.
- Replaces `src/main.jsx` with a thin entrypoint and creates `src/app/App.jsx` as a compatibility wrapper.
- Copies the current template's `framework/`, `prototype-ui/`, `project/`, `pages/`, and `docs/` folders into the project for staged migration.
- Installs the latest `mlp-loop-review.mjs` and package scripts.
- Runs `npm run mlp:review` and `npm run build` unless `--skip-verify` is passed.

Use `--dry-run` to preview the migration without changing files:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/migrate-project-to-layered.sh <project-slug-or-absolute-path> --dry-run
```

This first migration stage preserves runtime behavior by keeping the old project inside `legacy/`. After it passes review/build, gradually move data to `src/project/`, screens to `src/pages/`, documentation to `src/docs/`, and reusable UI to `src/prototype-ui/`. Do not attempt aggressive automatic semantic splitting unless the project has been backed up and the generated result is verified in a browser.

## Existing Project Editing Contract

When editing an existing MLP project for product requirements, treat it as content generation on top of the existing framework, not framework work.

- Preserve the workbench shell, project/settings rail, page directory rail, theme card, page directory, prototype state switch, `PhoneFrame`, Product Notes panel, update toast, connector overlay, managed CSS guard blocks, and review scripts.
- Edit dynamic product content only: project copy, page directory data, page state arrays, screen components, Product Notes data, UI checklist rows, prompts, product lists/templates, and page-specific app UI inside the phone viewport.
- Do not alter desktop workspace widths, Product Notes width, project/settings rail layout, page directory rail layout, directory scroll behavior, phone shell, theme token names, update toast behavior, connector behavior, or managed guard blocks during ordinary page/content edits.
- If a product page needs a new shared pattern, first use existing component patterns. If the framework itself must change, update the framework template and skill references first, then sync projects through the framework refresh command instead of hand-editing each project shell.
- After ordinary product edits, run `npm run mlp:review` and `npm run build`. If review reports framework structure or theme isolation failures, treat that as framework drift and repair through refresh/shell migration before continuing product work.

For framework updates across existing projects, use the one-command wrapper instead of manually copying template files:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/refresh-project.sh <project-slug-or-absolute-path>
```

This keeps framework changes centralized and minimizes project-by-project incompatibility.

## New Project Initialization

When the user starts a new prototype design project, the first task is to create a clean, isolated project framework.

- All prototype projects must live under the configured MLP project root.
- Resolve the MLP project root in this order: user-specified path for the current task, `MLP_PROJECT_ROOT` environment variable, then the default `~/Documents/Codex/mlp-projects/`.
- The required canonical path shape is `<MLP_PROJECT_ROOT>/<project-slug>/`.
- Do not create or run project code inside a conversation workspace or temporary chat/worktree folder, and do not create root-level folders such as `<workspace>/<project-slug>/`. Workspace-local project folders are treated as misplaced and should be migrated or synchronized into `<MLP_PROJECT_ROOT>/<project-slug>/` before running, modifying, or deploying.
- Create a new project directory with a unique slug under `<MLP_PROJECT_ROOT>/`. Do not place multiple prototype projects in one folder.
- Each project must have its own local preview address and cloud deployment path. Separate projects by folder, local port, and deployment slug; do not treat different pages inside one project as separate projects.
- Never overwrite, delete, or reuse another project's source files for the new project.
- Never share mutable project data between prototype projects. Each project owns its own `project`, `pageDirectory`, page state arrays, product data arrays, notes data, UI checklist, and generated assets.
- Initialize the project by copying `assets/framework-template/`. Do not start from a blank Vite app unless the user explicitly asks for a blank implementation.
- After initialization, update only neutral project identity placeholders if known, such as project name, slug, path, and directory title. Leave business page content as template/placeholder content until the user provides requirements.
- After the framework is initialized, provide the local project path and local preview URL. Then wait for the user's product requirements before designing pages.
- If the requested target directory already exists and is not clearly the current active project, do not overwrite it. Choose a new unique directory or ask for confirmation.

For new prototype projects, start from `assets/framework-template/` unless the user explicitly asks for a different stack or a blank implementation. This template preserves the accepted review workspace while removing the previous project's business pages. It keeps only one sample page plus framework docs/components so new projects start cleanly without inherited product data. Copy the framework template first, then replace only the dynamic content areas: project data, page maps, page states, screen content, UI checklist, and notes.

Do not rebuild the prototype shell from scratch when the template can be adapted. Keeping the shell, layout classes, spacing, directory behavior, state switch behavior, notes panel behavior, and reusable components intact is the default path for consistency across projects.

Before using or changing the template, read `references/template-contract.md`. It defines which parts are fixed shell/visual system and which parts are dynamic project content.

`assets/current-workbench-template/` is kept only as a full historical example of the current project. Do not use it for new project initialization unless the user explicitly asks to clone the full example.

To scaffold a new clean project from the accepted framework, prefer:

```bash
MLP_PROJECT_ROOT="$HOME/Documents/Codex/mlp-projects" /path/to/mobile-lowfi-prototype/scripts/scaffold-framework-project.sh <project-slug>
```

or simply pass a slug and let the script place it under the configured canonical root:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/scaffold-framework-project.sh <project-slug>
```

For every new project, define:

```text
project.name: human-readable name
project.slug: lowercase URL-safe identifier
project.path: /<project.slug>/
```

Do not deploy new prototypes to the domain root as the default. Use a unique project path so previous projects are not overwritten.

Recommended project shape:

```text
prototype-name/
├── index.html
├── package.json
└── src/
    ├── main.jsx
    └── styles.css
    └── vite.config.js
```

Keep the prototype shareable as a static site. Do not require a backend unless the user asks for online editing, accounts, comments, or persistence.

## Existing Project Framework Refresh

When the user asks to update an old MLP project to the latest framework, treat it as a framework refresh, not a product redesign.

Trigger phrases include:

- `同步最新 mlp 框架`
- `刷新 mlp 框架`
- `升级旧 mlp 项目框架`
- `按最新 mlp 规范更新这个项目`
- `把旧项目补上新的框架逻辑`
- `同步更新提示/版本提示`

For these requests:

1. Read `references/framework-refresh.md` before editing.
2. Identify the target project under `<MLP_PROJECT_ROOT>/<project-slug>/`.
3. Preserve product-specific pages, page states, notes, prompts, data arrays, page numbering, and interaction flows.
4. Patch only shared framework shell, CSS tokens, workbench behavior, deployment/version support, and reusable framework logic.
5. Do not replace the entire existing project with `assets/framework-template/`.
6. Add missing framework logic such as the fixed bottom update toast, `version.json`, and `scripts/write-version.mjs` when the project lacks them.
7. Run the skill's framework guard sync script before final verification:
   `node <mobile-lowfi-prototype-skill-dir>/scripts/sync-framework-guards.mjs <MLP_PROJECT_ROOT>/<project-slug>`.
   This is required for framework refresh because it installs the latest `mlp:review` script and updates the managed strict CSS guard block that fixes known framework drift such as bottom tab active-state styling, unreadable theme text, and login/member/card contrast issues.
   The guard sync must also preserve protected workbench visual details: Theme, Guide, and right-panel mode cards use the same hard-coded compact card/toggle style; prototype state chips stay transparent except for the active chip; Product Notes and Test Cases stay as separate right-side views; and primary tabs must not add an extra black bottom shell block.
8. Run `npm run mlp:review` and fix all failures before handoff.
9. Run `npm run build` after changes; if dependencies are missing, run `npm install --cache .npm-cache` first.

For a standard existing-project framework update, prefer the one-command refresh wrapper:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/refresh-project.sh <project-slug-or-absolute-path>
```

This command resolves the project, syncs the latest framework guards and review script, installs dependencies only when missing, runs `npm run mlp:review`, and runs `npm run build`. If the project has nonstandard React shell structure, the command must fail during review instead of silently handing off a broken refresh.

## Specified Directory Page Style Refresh

When the user asks to update a specific page in the left directory according to MLP styling, treat it as a page-level style refresh, not a full project redesign and not a full framework refresh.

Trigger phrases include:

- `按 mlp 更新 <页面名> 样式`
- `用 mlp 规范刷新 <页面名>`
- `指定 <页面名> 根据 mlp 更新样式`
- `把目录里的 <页面名> 按最新 mlp 样式同步`
- `只更新 <页面名> 的 mlp 样式`

For these requests:

1. Identify the target project under `<MLP_PROJECT_ROOT>/<project-slug>/`. If the user did not name a project, use the current active MLP project only when it is unambiguous.
2. Match `<页面名>` against the left directory page label, page id, page number, and known group label. If multiple pages match, ask one concise clarification instead of guessing.
3. Preserve the project framework shell: do not change workspace columns, project/settings rail, page directory, Product Notes panel, state switch shell, connector overlay, update toast, phone shell, or deployment config.
4. Refresh only the selected page's phone UI and its page states. Convert that page's colors, surfaces, text, borders, radius, spacing, button styles, bottom bars, drawers, sheets, modals, toast, placeholders, and list/card patterns to the current MLP phone tokens and reusable component patterns.
5. Keep the selected page's product flow, data, navigation, component ids, page/state numbering, and Product Notes content unless the user explicitly asks to change requirements or documentation.
6. If the selected page has multiple states, update all states unless the user names a specific state. If a specific state is named, update only that state and avoid changing other states.
7. After page-level style refresh, run the framework guard sync script first so the latest shell/review rules are present, then run `npm run mlp:review` and `npm run build`.
8. Verify the selected page in a browser at both light and dark phone themes when feasible. Confirm the page remains readable in both themes and does not use `--workspace-*` variables inside phone UI.
9. Report the refreshed page name/state scope and local preview URL. Do not deploy unless the user explicitly asks for deployment.

Page-level style refresh is for existing MLP pages that are structurally correct but visually stale. If the page's actual layout or flow is wrong, handle it as a normal product design change instead.

Create or reuse low-fi components for:

- Phone frame / prototype shell
- Page directory
- Product notes panel
- App status bar
- Top navigation
- Bottom tabs
- Hero/banner placeholder
- Primary/secondary buttons
- Locked bottom action bar
- Upload area
- Tool grid
- Horizontal template cards
- Template cover cards with text-free 3:4 cover placeholders and title below
- Horizontally scrollable category/filter tabs
- List rows
- State cards
- Membership/permission cards
- Email/phone login page according to project requirements
- Energy/credit center, member purchase page, confirmation dialogs, and failure/insufficient-balance dialogs when paid generation is involved
- Row-based form fields
- Bottom sheet
- Action sheet
- Left-side drawer
- Toast feedback
- Modal/dialog
- Empty, loading, and error state cards

Framework example requirements:

- The scaffolded example must include a primary page with locked bottom navigation.
- The primary page must include one action that navigates to a secondary page and one action that opens a left drawer.
- The scaffolded example must include a secondary page with locked top title/back bar and no bottom navigation.
- The secondary page must include actions that trigger bottom sheet, modal/dialog, and toast states. The sheet and modal states must include clickable backdrops that cover the phone status bar, and every action row/button inside those layers must have a defined click result. If the sheet/modal layer is mounted inside a clipped phone content container, use a separate phone-level status-bar scrim for the status bar area.
- Component trigger examples must use the same global color, radius, spacing, border-width, and card logic as the component library; do not create isolated demo styles.
- In the framework template, all colors, border radii, and ordinary line widths must be controlled through global CSS variables. Do not hard-code one-off colors, radius values, or ordinary `1px/2px` line widths outside the token definitions.
- When updating an existing project to this framework, treat the same variable system as a migration target for existing page UI. Convert hard-coded page colors, radii, spacing, border widths, bottom bars, and reusable layer styles to the shared tokens so the latest `light` and `dark` phone themes apply without deleting or redesigning existing product screens.

Page hierarchy rules:

- Primary pages are top-level app tabs, such as Home, Create, and Profile.
- Primary pages must show the bottom tab navigation.
- Primary page bottom navigation must be locked to the bottom of the phone canvas and remain visible while page content scrolls.
- Primary pages must not show a top page title bar or back button.
- Secondary pages are task/detail/document pages, such as import, editor, list, detail, result, component library, and optional documentation pages requested by the user.
- Secondary pages must show a top bar with back button and page title.
- Secondary page top bars must be locked to the top of the app content area and remain visible while page content scrolls.
- Secondary pages must not show bottom tab navigation.
- The left-side page directory may navigate to both primary and secondary pages, but the phone UI must still obey the page hierarchy.
- Multi-step feature flows that represent real routed screens should be modeled as separate secondary pages in the left directory, not as page states. Use page states only for alternate conditions of the same real page, such as loading, empty, failed, selected, or permission-limited views.
- For multi-step flows, place a compact stepper at the top of each step page inside the phone canvas. Keep it visually consistent across all steps, and keep each step page's prototype state switch as `默认态` unless that page has real alternate states.
- Long-content secondary pages should use an internal scrollable content area and a locked bottom action area. Bottom actions must remain visible while the content scrolls, and the locked action area needs its own solid background/separator so content does not visually mix with the buttons.

Login flow rules:

- Treat `国内登录` and `海外登录` as separate secondary pages when both markets are in scope. Put them in a dedicated `登录流程` directory group.
- Do not merge domestic and overseas methods into one mixed login screen.
- Domestic login default state is `一键登录`: show a one-tap phone authorization page with masked phone number, carrier certification label, primary one-tap button, `其他手机号登录` secondary entry, and agreement text. Do not show a separate domestic method-choice page.
- Domestic one-tap authorization should not include an extra logo/title block such as an icon plus `一键登录` plus `运营商认证服务` above the phone number. Keep the screen focused on masked number, primary button, alternate phone-login entry, and agreement.
- Domestic verification-code login is reached from `其他手机号登录`. It should use a light row-based form: page title such as `手机号登录`, helper text if useful, phone row, SMS code row with inline `获取验证码`, agreement checkbox, and login button. Do not put a redundant hero block above the form.
- Domestic login page states should normally be `一键登录`, `验证码登录`, and `验证码已发`. Do not add a domestic failure-popup state unless the user explicitly asks for one.
- Overseas login default state may show method choice with `邮箱验证码登录` and `Google 登录`. Include a lightweight user-facing heading area when the page otherwise feels empty, such as `登录你的账号` and `同步作品和能量记录`; do not use internal prompt-like copy such as `选择一种方式继续使用`.
- Overseas Google authorization should be represented as a modal/popup state. Failure can also be represented as a modal state when needed.
- Login sub-flow switching must not create a second top-left back button inside the phone page. Secondary pages already have the page-level back button. Put flow switches such as `返回一键登录` or `选择其他方式` below the primary login button, or use a small bottom/icon text switch.
- When switching between `国内登录` and `海外登录` from the directory, normalize the login state to the selected page's default state if the previous state's id does not belong to the new page. Product Notes and the prototype state switch must update with the normalized state.

Bottom action standard:

- Use the accepted content-analysis page bottom action pattern as the default for all mobile prototype bottom buttons.
- For long or form-like secondary pages, use `mobile-scroll-with-actions` for the full page, `mobile-scroll-content` for the internal scrolling body, and `bottom-action-bar` for the locked bottom operation area.
- The locked bottom area must remain visible while content scrolls, sit at the bottom of the phone canvas, use the page background, and include `border-top: 1px solid #2A2A2A`.
- The bottom action area uses `padding: 12px 0 16px`, no extra outer card, and no nested card around the buttons.
- One action: `bottom-action-bar single` with one full-width `bottom-cta`.
- Two actions: `bottom-action-bar dual` with columns `112px minmax(0, 1fr)` and `10px` gap. The secondary `ghost-cta` is left, the primary `bottom-cta` is right.
- Bottom buttons use `min-height: 44px`, `border-radius: 12px`, `font-size: 14px`, `line-height: 1.2`, and `font-weight: 800`.
- Primary bottom button: `background: #2A2A2A`, `border: 1px solid #2A2A2A`, `color: #FFFFFF`.
- Secondary bottom button: `background: #1C1C1C`, `border: 1px solid #3A3A3A`, `color: #F2F2F2`.
- All ordinary button and control borders use `1px solid`; do not use mixed line widths, dashed borders, double borders, or `2px+` emphasis borders unless explicitly approved.
- Bottom action groups always use `12px` radius. Do not mix pill buttons and rectangular buttons in the same bottom action group.
- Compact chips use `32px` height, `999px` radius, `1px solid #3A3A3A` border, and selected state `#F2F2F2` background with `#111111` text.
- Icon buttons use `32px x 32px` compact size or `36px x 36px` navigation size, `10px` radius, and `16-20px` icons.
- Do not introduce older pill-shaped, floating, or page-flow bottom button styles on new pages. When touching an existing page's bottom actions, normalize them to this standard unless the user explicitly asks otherwise.

Numbering rules:

- Every real page must have a stable page number in the form `1`, `2`, `3`, etc. Do not renumber existing pages casually after iteration begins.
- Every page state must have a state number in the form `1-1`, `1-2`, `1-3`, etc., where `1` is the parent page number. Examples: `3-1 工作台默认态`, `3-2 未制作态`, `3-3 AI美体态`.
- Every UI component or interaction point inside a page state must have a component number in the form `1-1-1`, `1-1-2`, `1-1-3`, etc.
- Component numbers must be shown in the right-side interaction/product notes and must match the corresponding component in the prototype. If visible number badges would clutter the phone UI, show the numbers in the documentation panel and use hover/highlight linkage rather than placing large labels in the phone UI.
- Numbering must distinguish page states from in-page controls. `1-2` means the second state of page 1; `1-2-3` means the third documented component inside state `1-2`.
- Prototype-only state switches outside the phone canvas are framework viewer controls. Do not give them component numbers, do not bind them to connector lines, and do not list them in Product Notes interaction cards. Page/state numbers in the notes header and UI checklist are enough to explain the current state.
- The prototype state switch above the phone canvas should be persistent for every page. If a page has only one state, still show a single `Default/默认态` state item so page states remain explicit and consistent with the UI design checklist.
- When a component contains multiple buttons or controls, each button/control must receive its own component number and click/tap effect. A toolbar with undo, redo, brush, erase, small brush, medium brush, and large brush should be documented as seven numbered controls, not one generic toolbar item.
- Drawer, sheet, action sheet, and modal contents are not exceptions: each visible close button, backdrop, cancel button, row action, and confirm button must have a concrete click/tap effect in the prototype and Product Notes.
- The UI design checklist at the end of the directory must list every real app/prototype page and every real state that UI needs to design, using the page/state numbering system. It must exclude supporting documentation pages such as prompts, appendices, UI spec pages, and empty component library pages. The checklist should include state names, status labels, and whether a state still needs UI design review. The checklist page must include a quantity summary that counts all checklist rows/page states, not unique page names. The checklist page must support click selection: selecting a row updates a right-side preview to the matching page/state, and that preview must reuse the real prototype components at the original phone size and ratio instead of rendering a reduced, cropped, or separately mocked version. The checklist preview should not show the prototype-only state switch or an extra preview title bar; state changes and labels happen by selecting rows in the checklist. The preview should align vertically with the selected checklist item when feasible, using the selected row's position rather than a fixed top placement, but must clamp its vertical offset so the prototype remains visible in the current viewport.

Page state vs in-page interaction rules:

- A **page state** is a variation of the same page under a different data, permission, loading, empty, error, selected-mode, or scenario condition. Examples: not started vs created, empty list vs populated list, loading vs failed, logged out vs logged in, normal creation workspace vs AI body-editing scenario.
- A page state is used for prototype review and requirement explanation. It should not be treated as a separate app page unless the user explicitly says it is a real route or screen.
- Do not add page states to the left-side page directory as separate pages by default. The page directory should list real pages/screens, not every state variation.
- Do not place state-switch controls inside the mobile phone UI unless the state switch is a real user-facing product control. For prototype review, place state switches outside the phone canvas as prototype-viewer controls.
- A **page interaction element** is a real control inside the app UI that users can operate, such as a button, tab, segmented control, input, slider, toolbar item, template card, upload area, checkbox, or bottom navigation item.
- In-page interaction elements must be documented as product behavior. Every component and every button/control inside that component must have an explicit trigger and click/tap effect. Do not describe only the component as a whole when it contains multiple buttons.
- Input and output fields are optional in interaction notes. Include them only when the interaction has meaningful data input, submitted parameters, returned data, state mutation, generated artifacts, or navigation output. Omit them for simple local UI toggles when input/output would be redundant.
- Interaction notes should still cover data boundaries, disabled state, loading state, empty/error behavior, permissions, analytics, and acceptance criteria when those are relevant to the control.
- When in doubt, ask: "Would this control exist in the shipped app?" If yes, it belongs inside the phone UI as an interaction element. If no, and it only helps PM/UI/dev review different scenarios, it belongs outside the phone UI as a prototype state switch.
- Right-side Product Notes interaction cards must document only real App page elements inside the phone UI. Do not document the prototype-only state switch, directory navigation, theme switch, update toast, or other workbench controls as page interactions.

Product Notes field rules:

- `页面说明`: include page number, state number, page name, state name, page purpose, page structure, and basic behavior.
- `页面元素清单`: list every meaningful element in the current page state. Each element has component number, name, type, purpose, required rule, backend API dependency, and display rule. Non-interactive display elements should appear here even when they do not need an interaction card.
- `交互说明`: only for real phone UI controls. Each interaction card must include component number, component name, component type, basic operation and result, upload/input rules, backend API dependency, required rule, state feedback, exception handling, data boundary, permission logic, tracking suggestion, and acceptance criteria when relevant.
- `状态/异常矩阵`: summarize loading, empty, error, disabled, permission, backend failure, and data-boundary states for the current page state. Do not hide these only inside a single interaction card.
- `测试用例`: generate test cases in the separate right-side `Test Cases` view, not inside interaction element cards. Each case should have an id, associated component/state, test type, precondition when needed, steps, and expected result. Keep the test case groups as `功能测试`, `边界测试`, `异常测试`, `权限测试`, and `埋点测试`.

Common input/upload boundaries to use unless the user or product domain says otherwise:

- Image upload: `JPG/PNG/HEIC/WEBP`, default single image, auxiliary/reference image max `1`, file size `≤20MB`, recommended short side `≥512px`, long side `≤4096px`.
- Video upload/processing: `MP4/MOV`, file size `≤200MB`, duration `3-60s`, recommended `720p+`.
- Prompt text: default `0-200` Chinese/English characters; complex generation prompts may extend to `500`; reject or warn for sensitive words, only whitespace, or over-limit content.
- Nickname: `1-20` characters.
- Search keyword: `0-30` characters; empty search shows default list.
- SMS code/email code: default `4-6` characters; validity period, resend interval, and max attempts follow backend config.
- Mainland China phone: `11` digits, numeric only, validate carrier/format/risk.
- Email: max `64` characters, trim leading/trailing spaces, validate email format.
- Template/recommendation list: default page size `8`; empty state and retry state are required.
- Submit/generate/payment buttons: required fields unmet means disabled or clear inline prompt; after click show loading and prevent duplicate submit; failure preserves user input and provides retry or recovery path.

## Verification

Before finalizing:

- Run the production build.
- Open the local app in a browser.
- Verify the homepage renders.
- Verify the page directory navigates to key pages.
- Verify primary pages show bottom tabs and no top back/title bar.
- Verify secondary pages show top back/title bar and no bottom tabs.
- Verify every affected phone page/state keeps standard left/right page padding (`16px` by default, `14px` only for dense tool screens). Check component library/demo pages as real phone pages. Flag or fix any page whose content touches the phone edge except approved full-bleed elements.
- Click through the primary flow.
- Verify the component library page if present.
- Verify at least one secondary flow such as template list/detail or profile.
- Check browser console errors.
- Confirm the CSS contains no dashed wireframe styling when using this standard.

Use Playwright or the available browser tool for actual UI verification.

## Preview And Deployment Trigger

During prototype iteration, default to local preview instead of cloud deployment.

- After frontend changes, run or reuse the local dev server and provide the local preview URL, usually `http://127.0.0.1:5173/`.
- If the default Vite port is occupied, use the next available local port and report the exact URL.
- Treat requests such as "部署", "部署一下", "部署线上", "发到服务器", "更新线上", "上线", "发布到云端", "同步到阿里云", or "给我线上地址" as explicit cloud deployment intent.
- Do not deploy to the cloud after routine prototype edits unless the user explicitly asks for online deployment.
- When the user asks for local preview, do not spend time on SSH, packaging, or Nginx deployment.
- When the user asks for cloud deployment, first read `references/deployment.md` for the configured prototype server, static root, Nginx paths, and independent project URL pattern. Then build the static files, deploy to the configured independent project path, and return the online URL after verification.
- For the configured prototype server, default to SSH alias `prototype-budgit`. Do not ask again for server IP, SSH user, domain, Nginx path, or static root unless the alias fails or the user asks to use another server.
- Cloud deployment is project-level. Deploy `<MLP_PROJECT_ROOT>/<project-slug>/` to `https://prototype.budgit.cc/<project-slug>/`; do not deploy misplaced workspace-local project folders or page/state URLs.
- Every project build should update `public/version.json` before Vite builds. The front end should read `version.json` on load, poll it every 180 seconds with a cache-busting query string, and show the fixed bottom update toast when the remote version changes. Never auto-refresh the page.
- Page-level directory update badges are separate from the global update toast. Store viewed page versions locally with a project-scoped key such as `mlp-page-read:<project.slug>`, mapping `pageId -> updatedAt/version`. When a user opens a page, mark that page's current update key as viewed. When a page is modified in code, update that page's `updatedAt` or `version` value so returning users see the `更新` badge until they open the page.

## Project Center, Releases, And Access

MLP has a local platform metadata layer under each project:

```text
<project>/.mlp/
├── project.json
├── versions.json
├── current.json
├── access.json
└── releases/
    └── x.x.xx/
        └── dist/
```

Version numbers use `x.x.xx`, for example `1.0.01`.

- Major version: product direction or core flow changes.
- Minor version: important page structure or feature-flow changes.
- Patch number: copy, notes, tests, visual fixes, and small interaction changes.

Create a release:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/mlp-version.sh release <project-slug-or-path> --version 1.0.01 --title "初始版本"
```

If no explicit version is supplied, patch bump is used by default:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/mlp-version.sh release <project-slug-or-path>
```

List versions:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/mlp-version.sh list <project-slug-or-path>
```

Rollback current pointer:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/mlp-version.sh rollback <project-slug-or-path> 1.0.01
```

Generate the local project center:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/mlp-center.sh
```

This writes:

```text
<MLP_PROJECT_ROOT>/_project-center/index.html
<MLP_PROJECT_ROOT>/_project-center/projects.json
```

Access metadata is stored per project:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/mlp-access.sh public <project-slug-or-path>
<mobile-lowfi-prototype-skill-dir>/scripts/mlp-access.sh password <project-slug-or-path> <password>
<mobile-lowfi-prototype-skill-dir>/scripts/mlp-access.sh show <project-slug-or-path>
```

The access script stores only a salted hash in `.mlp/access.json`, not the plaintext password. This metadata does not by itself enforce security in a static file server; cloud deployment must enforce password protection through Nginx Basic Auth or a future application auth layer.

## Deployment

Use `references/deployment.md` when deploying. Default to a static Nginx deployment.

Do not store server passwords, SSH keys, API tokens, or certificates in the skill. If credentials are needed, ask the user in the current thread and recommend rotating any password shared in chat.

## Iteration Style

When the user dislikes a prototype style, revise decisively instead of making tiny tweaks. Preserve the product structure and interaction unless the user asks to change the flow.

For long-term use, treat each new feature request as:

```text
Requirement description -> low-fi layout/clickable prototype -> user confirms whole or partial design completion -> detailed notes for confirmed scope -> verification -> optional deployment
```
