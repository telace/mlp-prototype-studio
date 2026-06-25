# Framework Refresh For Existing MLP Projects

Use this reference when the user asks to update an existing MLP prototype to the latest shared framework without redesigning the product pages.

Trigger phrases include:

- `同步最新 mlp 框架`
- `刷新 mlp 框架`
- `升级旧 mlp 项目框架`
- `按最新 mlp 规范更新这个项目`
- `把旧项目补上新的框架逻辑`
- `把旧项目从 legacy 拆分到最终框架`
- `语义拆分旧 MLP 项目`
- `同步更新提示/版本提示`

## Goal

Bring an existing prototype under `<MLP_PROJECT_ROOT>/<project-slug>/` up to the latest framework shell and shared behavior while preserving product-specific pages, flows, copy, notes, and demo data.

Resolve `<MLP_PROJECT_ROOT>` in this order: user-specified path for the current task, `MLP_PROJECT_ROOT` environment variable, then the default `~/Documents/Codex/mlp-projects/`.

This is not a visual redesign request. Do not change page layouts, business flows, product decisions, or screen content unless the user explicitly asks.

If the user asks to sync the latest framework, two phone themes, or latest UI style into an existing project, keep the existing page UI and migrate its styling to the latest tokenized framework. Convert hard-coded page colors, radii, spacing, border widths, buttons, image placeholders, bottom bars, sheets, drawers, toasts, and modals to the shared phone-scoped CSS variables and reusable component classes. The goal is that existing pages visually follow the new framework and both `light` and `dark` themes without replacing product screens with the framework demo pages.

Framework refresh is the only normal path for changing protected shell behavior across projects. Ordinary product editing must not hand-edit the workbench shell, Product Notes width, left rail layout, directory scroll, phone shell, theme token names, update toast, connector overlay, or managed CSS guard blocks.

Framework maintenance must keep the implementation sources aligned. A framework change is incomplete unless all three sources are updated together:

- `assets/framework-template/` for new project scaffolding.
- `scripts/sync-framework-guards.mjs` for old project refreshes.
- `assets/framework-template/scripts/mlp-loop-review.mjs` for drift detection and CI-style failure.
- `assets/framework-template/scripts/mlp-runtime-review.mjs` for browser-level blank-page and route-state acceptance.

Do not treat `SKILL.md`, `template-contract.md`, or this reference as executable by themselves. They describe the rule; the template, sync guard, and review script enforce it.

## Required Inputs

1. Identify the target project slug.
2. Confirm the project source path is `<MLP_PROJECT_ROOT>/<project-slug>/`.
3. Read:
   - the current `mobile-lowfi-prototype/SKILL.md`
   - `references/template-contract.md`
   - `references/visual-standard.md`
   - `references/component-patterns.md`
4. Use `assets/framework-template/` as the source of truth for shared shell behavior, not as a full replacement for the existing project.

## Refresh Scope

Allowed changes:

- Workbench shell structure and shared classes.
- Desktop workspace fixed widths:
  - project/settings rail `210px`
  - page directory rail `210px`
  - center prototype column `431px`
  - Product Notes `546px`
  - column gap `20px`
  - total width `1457px`
- Directory status indicators:
  - `approved` / 已定稿: blue `#3B82F6`
  - `draft` / 调整中: yellow `#FACC15`
  - the directory status legend always shows both `已定稿` and `调整中`, even if the current project has no pages in one of those statuses
- Page-level unread update badges:
  - each page may define `updatedAt` or `version` as its update key
  - store viewed values locally with a project-scoped key such as `mlp-page-read:<project.slug>`
  - show the row-level `更新` badge only when the current page update key differs from the locally viewed key
  - mark a page as viewed when the user opens it
  - keep `更新` out of the status legend because it is metadata, not a review status
- Prototype-only state switch behavior:
  - always visible
  - no leading `状态` label
  - chips sized to text
  - click switches state
  - overflowing chips can center the active item
- Product Notes panel height and panel-local anchor scrolling.
- UI design checklist behavior when the project has that page:
  - rows are selectable
  - selected row previews the matching page/state using real prototype components
  - no extra title bar above the preview
  - preview hides the prototype-only state switch
  - quantity summary counts checklist rows/page states
- Shared bottom action standards.
- Shared button, spacing, radius, color, and image placeholder tokens.
- Existing page UI token migration:
  - preserve existing screen structure, copy, data, and click flow
  - replace page-specific hard-coded colors with phone-scoped theme variables
  - replace one-off radii, spacing, line widths, and button styles with shared tokens
  - normalize bottom bars, sheets, drawers, toasts, modals, and image placeholders to reusable component patterns
  - add or preserve `project.defaultTheme` as the project's default phone theme; choose `light` or `dark` based on the current product direction, and fall back to `light` only when the project has no clear preference
  - use `project.defaultTheme` on first open when no project-scoped saved theme exists
  - verify both `light` and `dark` phone themes on existing pages
- Page padding fixes required by the shared visual standard. Existing real phone pages, component library pages, and in-phone demo pages should keep standard horizontal padding (`16px` default, `14px` only for dense tool screens), except for approved full-bleed structural elements such as status bars, top bars, bottom bars, full-screen canvases/media, and overlay scrims.
- Secondary-page sheet/modal scrim fixes. If an existing sheet or modal is mounted inside `.screen` or another clipped content area and the scrim cannot cover the phone system status bar, add a phone-level status-bar scrim tied to the same open state. It must use the same solid scrim token and close or return state when tapped.
- Reusable component patterns:
  - fixed primary/secondary buttons
  - compact chips and icon buttons
  - row-based form fields
  - bottom sheet
  - action sheet
  - left-side drawer
  - toast feedback
  - modal/dialog
  - empty/loading/error state cards
- Workbench-level update toast:
  - `UpdateBanner` component rendered as a fixed bottom update toast
  - `public/version.json`
  - `scripts/write-version.mjs`
  - `package.json` `prebuild` script
  - toast text: `原型已更新，点击刷新查看最新版本`
  - 180-second polling with cache-busting
  - click to `window.location.reload()`
  - never auto-refresh
- Deployment-related version verification.
- Runtime route acceptance:
  - Add `scripts/mlp-runtime-review.mjs`.
  - Add package scripts `mlp:runtime-review` and `mlp:acceptance`.
  - `mlp:runtime-review` must open every real page/state route in a real headless Chrome session, capture runtime exceptions, verify the workbench is not blank, verify phone pages render `.phone` and `.spec-panel`, verify docs pages render their docs stage, and verify intentionally invalid page/state URLs fall back to a valid route when the project has hash routing.
  - `mlp:runtime-review` must also validate computed text/background contrast for direct text elements inside the phone in both `light` and `dark` themes. This catches wrong token combinations that static color-token checks cannot detect.
  - `mlp:route-check` must run the normal refresh validation without visual review.
  - `mlp:acceptance` remains the full non-visual final check and must not include visual review.
  - `mlp:visual-acceptance` is the explicit visual gate and must run only when requested.
- Managed framework guard updates:
  - Keep `MLP FRAMEWORK SHELL GUARDS` and `MLP STRICT FRAMEWORK GUARDS` as generated blocks.
  - Do not manually edit these blocks inside individual projects. Change the skill/template/sync script first, then re-run `refresh-project.sh`.
  - The refresh command may update these blocks in place without touching product pages.

Disallowed changes unless explicitly requested:

- Replacing the entire existing project with `framework-template`.
- Removing product pages, page states, notes, prompt cards, or business data.
- Renumbering pages or states.
- Changing mobile app flows.
- Redesigning screens because a newer template looks different.
- Moving project files outside `<MLP_PROJECT_ROOT>/<project-slug>/`.
- Copying `node_modules`, `.npm-cache`, `dist`, Playwright logs, or deployment backups from templates into the project.
- Editing product screens by replacing them with framework example screens.
- Making one-off shell fixes in a project when the same fix belongs in the shared skill/template.

## Recommended Procedure

For a normal existing-project framework update, use the one-command wrapper first:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/refresh-project.sh <project-slug-or-absolute-path>
```

The wrapper resolves `<MLP_PROJECT_ROOT>/<project-slug>` when a slug is provided, runs the sync script, installs dependencies only when missing, then runs `npm run mlp:route-check` when available, falling back to `npm run mlp:fast-check` or `npm run mlp:review && npm run build`. It is the preferred handoff command for other local agents or workflows such as Hermes. A passing run means the project has the latest managed framework guards, current review script, buildable output, and route/runtime sanity where supported. A failing run means the project needs manual structural migration before handoff.

By default, `refresh-project.sh` does not run visual review and does not create screenshots. Pass `--full-acceptance` for complete non-visual acceptance. Pass `--visual-acceptance` only when the user explicitly asks for visual review, screenshots, or visual baseline checks:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/refresh-project.sh <project-slug-or-absolute-path> --full-acceptance
<mobile-lowfi-prototype-skill-dir>/scripts/refresh-project.sh <project-slug-or-absolute-path> --visual-acceptance
```

For a full structural migration to the final layered MLP framework, use:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/migrate-project-full.sh <project-slug-or-absolute-path>
```

This pipeline is stricter than `refresh-project.sh`. It creates a timestamped sibling backup, runs framework sync, runs semantic split when a legacy app exists, runs page/notes module split, performs post-migration audits for module structure, CSS split, hard-coded phone colors, old hand-written overlays, broad imports, and project data structure, then runs `npm run mlp:acceptance`. This migration acceptance is non-visual and does not capture screenshots by default. Run `npm run mlp:visual-acceptance` separately only when the user explicitly asks for visual review. It writes both JSON and Markdown reports under `.mlp/migration/reports/`. If a stage fails, it restores the project from the backup by default; pass `--keep-failed` only when you intentionally want to inspect the failed intermediate files.

The full migration pipeline intentionally avoids unsafe business rewrites. It may auto-convert known MLP structures, but unknown page UI, hard-coded styles, or custom overlays must become blocking report items rather than silent partial migrations.

For batch updates, call the wrapper once per project slug. Do not build a combined workspace or copy one project's `src/` over another project.

For a compatibility-migrated project that still renders the real product through `src/legacy/LegacyApp.jsx`, run the semantic split command after the compatibility migration:

```bash
<mobile-lowfi-prototype-skill-dir>/scripts/semantic-split-legacy-app.sh <project-slug-or-absolute-path>
```

This command is the standard path for moving old single-file MLP apps into the final layered structure. It creates a timestamped backup, splits app shell into `src/app/App.jsx`, shared framework components into `src/framework/`, reusable phone UI into `src/prototype-ui/`, routes into `src/project/routes.jsx`, product screens into `src/pages/`, and docs into `src/docs/`. Project data must be split into the mandatory files `src/project/meta.js`, `directory.js`, `states.js`, `mock-data.js`, `routing.js`, `notes/index.js`, and `test-cases/index.js`; `src/project/project-data.js` remains only as a compatibility barrel. It removes `src/legacy` from the active project after the backup is created, removes unused framework-template sample pages from the real project, updates the project review script for real project pages, then runs `npm run mlp:review` and `npm run build`.

If semantic split verification exposes missing imports or runtime-only dependencies, fix the split script itself before only patching the project. The migration script must reproduce the same corrected final structure on the next project.

1. Inspect the existing project:
   - `src/main.jsx`
   - `src/styles.css`
   - `package.json`
   - `public/`
2. Compare only shared shell and framework code against `assets/framework-template/`.
3. Patch the existing project in place. Prefer small targeted edits over wholesale file replacement.
4. If adding the update toast:
   - Add `UpdateBanner`, `readPrototypeVersion`, and `VERSION_POLL_INTERVAL_MS` near other shell helpers.
   - Render `<UpdateBanner />` as the first child inside `.app-shell`, before `.workspace`.
   - Add `.update-banner` CSS.
   - Add `scripts/write-version.mjs`.
   - Add `public/version.json`.
   - Add `"prebuild": "node scripts/write-version.mjs"` before `"build"` in `package.json`.
5. If updating styles:
   - Use fixed workspace CSS variables.
   - Keep mobile/tablet breakpoint single-column behavior.
   - Keep status indicator colors aligned with `visual-standard.md`.
   - Keep reusable component CSS aligned with `component-patterns.md`.
6. Run the framework guard sync script from the skill before final verification:
   ```bash
   node <mobile-lowfi-prototype-skill-dir>/scripts/sync-framework-guards.mjs <MLP_PROJECT_ROOT>/<project-slug>
   ```
   This script must be treated as part of framework refresh. It copies the latest `mlp:review` script, ensures `package.json` exposes `npm run mlp:review`, and inserts or updates two managed CSS blocks:
   - `MLP FRAMEWORK SHELL GUARDS`: fixes workspace background isolation, four fixed workspace columns, `546px` Product Notes width, bright hard-coded shell colors (`#F5F6F8` workspace, `#FFFFFF` panels, `#F3F4F6` muted document surfaces, `#E5E7EB` borders, `#5F6670` muted text), independent project/settings rail, independent theme card, scrollable page directory body, connector overlay styling, phone shell black frame, phone theme tokens, explicit `screen--primary` / `screen--secondary` / `screen--custom` viewport sizing, and secondary status-bar/topbar alignment.
   - `MLP STRICT FRAMEWORK GUARDS`: fixes common framework drift such as unreadable theme text, broken bottom tab active states, non-tokenized template titles, login/member control contrast issues, and member hero surfaces.
   The managed guards must also cover Theme/Guide card details, prototype state switch transparency, separate Product Notes/Test Cases right-panel structure, element-level Test Cases anchors, connector overlay colors, and the rule that primary tabs do not add an extra black bottom shell block.
   The shell guard is a safety net, not a substitute for structural migration. If `mlp:review` reports missing `getPageShellConfig`, `data-page-level`, `renderPhoneScreen`, screen viewport classes, `ConnectorOverlay`, or `data-interaction-id`, patch the React shell structure before handoff.
7. Run `npm install --cache .npm-cache` only if dependencies are missing.
8. Run `npm run mlp:review`. If it fails, patch the project until it passes; do not hand off a refreshed framework with failing review. The review includes App prototype color-token checks: phone/App selectors must not keep hard-coded color values after sync, except for theme token definitions and framework-shell exceptions.
   The review also fails when workspace, directory, state switch, Product Notes, or docs surfaces use phone theme variables such as `--app-bg`, `--surface-*`, `--text-strong`, or `--border`. These surfaces must keep fixed framework/workspace colors so switching light/dark affects only the phone prototype content.
9. Run `npm run build`.
10. Run `npm run mlp:route-check` for normal framework refresh validation. Use `npm run mlp:acceptance` for complete non-visual acceptance. Use `npm run mlp:visual-acceptance` only when the user explicitly asks for visual review. If runtime review reports runtime exceptions, missing `.workspace`, missing `.phone`, missing `.spec-panel`, missing docs stage, empty root text, or invalid state URLs that do not fall back, fix the project before handoff.
11. Report:
   - project path
   - changed framework areas
   - `mlp:review` result
   - build result
   - any items intentionally not changed

## Compatibility Strategy

To minimize incompatibility during framework sync:

- Keep business pages and page-specific components in place.
- Add missing shell classes and data attributes instead of renaming existing business pages.
- Use generated guard blocks for shared CSS so most visual framework corrections can be applied without replacing files.
- Use review failures as migration prompts. `手机框架结构` failures mean the React shell or connector overlay needs manual migration; `框架/主题隔离` failures mean workspace/directory/docs styles are still using phone theme variables; `App 配色 token 化` failures mean app page styles need token migration.
- After a project passes `refresh-project.sh`, future product edits should stay in dynamic content areas so later refreshes remain low-risk.

## Acceptance Criteria

- The existing product prototype still opens and navigates.
- Product pages, states, notes, prompts, and UI checklist data are preserved.
- Shared framework updates match the latest MLP standards.
- `npm run mlp:review` passes after the refresh and its issues are fixed, not merely reported.
- `npm run mlp:review` fails on protected shell drift, including Theme/Guide card styling drift, prototype state switch background drift, missing per-interaction test cases, missing connector overlay, workspace theme leakage, and any extra primary-tab bottom shell block.
- `npm run mlp:runtime-review` passes for every page/state route. This is required because static build/review can miss runtime-only blank pages caused by missing imports, invalid state combinations, or route crashes.
- `npm run mlp:route-check` passes before a normal framework refresh is considered complete.
- `npm run mlp:acceptance` passes before a project is considered non-visually ready for final handoff, deployment, or full migration/rebuild completion.
- `npm run mlp:visual-acceptance` passes only when the user explicitly requested visual review.
- Workspace/background isolation passes: `body`, `.app-shell`, left directory, docs, state switch, and Product Notes do not use phone theme variables and do not turn black when phone dark theme is active.
- Phone shell structure passes: the project exposes `getPageShellConfig`, `data-page-level`, `renderPhoneScreen`, `.screen--primary`, `.screen--secondary`, and a hard-coded black phone shell used only as the outer ring. Primary tabs must not add an extra black bottom shell layer.
- Interaction connector structure passes: the project renders `ConnectorOverlay`, every `bindInteraction` source exposes `data-interaction-id`, Product Notes and Test Cases both expose matching `interaction-<id>` anchors for the current page state, and connector layer/path/dot CSS exists. Missing connector DOM is a refresh failure, even when hover highlighting and Product Notes/Test Cases scrolling work.
- Phone/App prototype CSS uses global color tokens. Hard-coded colors inside app page/component selectors are treated as refresh failures unless they are part of `:root`/theme definitions or documented framework-shell exceptions.
- `npm run build` passes.
- `dist/version.json` exists after build when update toast support is installed.
