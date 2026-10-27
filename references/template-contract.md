# MLP Framework And Project Contract

This contract owns framework structure, project data boundaries, protected behavior, and compatibility. visual-standard.md owns prototype visual and interaction quality; component-patterns.md provides optional implementation recipes.

## Project Isolation

- One product prototype equals one project directory, dependency tree, build output, release history, deployment path, and access configuration.
- New MLP projects accept a project slug only and are created at `${MLP_PROJECT_ROOT:-~/Documents/Codex/mlp-projects}/<project-slug>/`. Do not scaffold a product project into the current conversation workspace, `outputs/`, or an arbitrary absolute/relative path.
- Never combine unrelated products as pages in one project or deploy one project's `dist/` over another.
- Keep `.mlp/project.json`, `.mlp/versions.json`, `.mlp/current.json`, `.mlp/access.json`, and immutable `.mlp/releases/<version>/dist/` as platform metadata.

## Layered Structure

```text
src/
  framework/       fixed review workbench
  prototype-ui/    optional phone components and default tokens
  project/         product metadata, directory, states, routes, notes, tests, mock data
  pages/           business page components and page layout CSS
  docs/            support-page components
docs/PRD.md         current product source of truth, bundled into the workbench
```

- Keep `src/main.jsx` thin.
- Keep `src/project/project-data.js` as a compatibility re-export barrel only.
- Split project data into `meta.js`, `design.js`, `directory.js`, `states.js`, `mock-data.js`, `routing.js`, `notes/`, and `test-cases/`; add `prompts.js` or `specs.js` only when needed.
- Put framework shell styles in `src/framework/`, component styles/tokens in `src/prototype-ui/`, and page appearance and layout rules in `src/pages/styles/pages.css`.

## Fixed Workbench

Preserve these framework-owned areas unless the task is explicitly a framework change:

- Four-column desktop workspace: project/settings `210px`, page directory `210px`, prototype `431px`, documentation `546px`, `20px` gaps, total `1457px`.
- Desktop panel target height `866px` with internal scrolling and responsive compact/collapse behavior from framework CSS.
- `PrototypeStage`, `PhoneFrame`, status bar, state switch, screenshot control, settings rail, `PageDirectory`, `SpecPanel`, annotation tools, connector overlay, command/handoff modals, and update toast.
- Bright fixed workbench palette. Phone theme tokens must not recolor workbench UI.
- The state switch remains outside the phone, always visible, text-sized, centered when fitting, and active-chip centered when overflowing. It is review UI, not a documented product element.
- Preserve the responsive shell contract: compact four columns at `1504px`, one-column workbench at `1180px`, single-column settings/directory groups at `680px`, and at `430px` scale `.phone` and `.prototype-stage-toolbar` together from the same top-center origin. Never scale only the phone or let the state switch drift out of alignment.

The phone canvas is `375 x 812`. Coordinate annotations use unscaled logical coordinates: viewport anchors start at the phone's top-left; content anchors measure y from the scroll content origin, including scrollTop. This workbench coordinate system does not prescribe product composition. Prototype visual and interaction guidance comes from `visual-standard.md`.

## Page Directory And States

- Order real pages by end-to-end user journey, then group adjacent pages by product capability or user goal.
- Never group by “primary/secondary” or “一级/二级”. Keep `level` only for phone-shell behavior.
- Put support docs/components after product-flow groups. Keep compatibility-only UI specification routes hidden and out of the directory.
- Keep two framework-owned support sections permanently in the page directory after all product-flow groups: `uiChecklist` labeled `UI设计清单`, and `prompts` labeled `提示词`. New-project scaffolding, framework refresh, migration, and project data edits must not remove, rename, hide, reorder ahead of product flows, or override these entries.
- Fixed support entries use stable `S*` support numbers and never consume or alter real product page numbers.
- Keep registered review states accessible through the state switch and UI checklist. Choose whether a product surface is a route, inline content or overlay according to the product.
- `approved` requires explicit user confirmation; otherwise use `draft`. Track unread updates separately through `updatedAt`/`version` and project-scoped local storage.
- Overlays may be interactive only or registered as review states when useful.
- Give every real page a unique stable integer `number`. Derive each state number as `<page>-<state>` and each documented component number as `<page>-<state>-<component>`. Do not renumber existing pages, states, or component anchors during ordinary edits, refreshes, or migrations; change numbering only when the user explicitly restructures the information architecture.
- Keep component numbers in Page Overview, Interaction Notes, Test Cases, and the UI checklist where relevant. Never number the prototype-only state switch or expose component numbers in the phone UI, directory, screenshot, or connector controls.

## Dynamic Project Areas

Change these per product:

- Project identity, default phone theme, current `designContract`, and synced PRD metadata.
- Page directory, states, routes, UI checklist, prompts, Product Notes, Test Cases, and mock/demo data.
- Business pages, custom components, page appearance and layout CSS.
- Component library examples only when the project has reusable patterns beyond the framework set.

Do not replace a designed existing project with template example pages during framework sync.

## Documentation And Annotation

- Update `docs/PRD.md` before every prototype change, then continue implementation without an intermediate confirmation gate.
- Expose the bundled PRD through `相关内容 -> PRD`. Treat it as a settings support page: it must not enter the real product page directory or UI design checklist. Static builds show the PRD content bundled at build time.
- Right-panel documentation is page/state-specific and has separate Page Overview, Interaction Notes, and Test Cases views.
- Automatic interaction-document generation remains disabled. Manual annotations in `src/project/notes/local-edits.json` are the current local documentation additions.
- Use stable `data-interaction-id` bindings for interactive and meaningful content elements. Element annotations attach to IDs; coordinate annotations use logical canvas coordinates.
- Local editors save through the dev API with field validation and a comparable-field `expectedHash`. Reject stale writes with a conflict response. A failed save must leave the editor open with the complete draft intact and show an actionable error; page/state/hash navigation and browser unload must warn while a draft is dirty. Static deployments are read-only without a real authenticated backend.
- A human save sets `checked: true`, `checkedBy: 'human'`, `reviewed: false`, and `updatedAt`. `checked` records human review; it is not a write lock. Humans may edit or uncheck later. AI generation, rebuild, migration, and framework sync may add missing entries or fill empty fields but must not overwrite checked human text unless explicitly requested.
- Clicking a saved annotation expands read-only detail. Editing is explicit. Element deletion is one-shot, requires confirmation, queues source cleanup, and supports restoration.
- Product Notes and Test Cases resolve the current state before rendering. Every generated test case carries the source `interactionId`, the same component number, and the current state number; Test Cases group under the same interaction element rather than becoming a detached page-level list.
- Connector navigation scrolls only the documentation panel through its own `scrollTop`/`scrollTo`. Do not use `scrollIntoView` on note or test cards because it can move the entire workbench. Automatic connector scrolling runs only while the interaction guide is enabled and must not fight deliberate manual panel scrolling.
- Component numbers belong in documentation, not the directory, state switch, screenshot, or shipped phone UI.

## Screenshot And Handoff

- Copy screenshot captures only phone prototype content at logical width `375px`, including status bar and complete long-page content.
- Exclude phone shell, state switch, annotation markers, and workbench chrome.
- `npm run mlp:export-ai` writes `exports/ai-handoff.md` and `public/ai-handoff.md` with project metadata, directory, states/routes, text layout trees, interactions, notes, tests, and checked status.

## Editing Boundary

- Ordinary product edits may change src/pages, dynamic src/project data, custom components, and page visual/layout CSS.
- Shared components may live in prototype-ui or project modules; reuse is optional.
- Workbench, guards, framework CSS, platform metadata tooling, version scripts, screenshot behavior, annotations, and documentation panels are protected framework areas.
- If a product request requires a protected change, update the template contract and framework template first, then use `framework-refresh.md` for affected projects.
- Before page edits, process pending element deletions and preserve checked human text as required by `SKILL.md`.

## Initial Template Scope

### New-project lifecycle

- Scaffolded projects start with `.mlp/project.json.lifecycle` set to `discovery`, a product-specific identity, an empty product directory, and a clean `draft` PRD.
- discovery starts with no product pages. Optional design notes may be incomplete at any stage.
- Before adding the first product page, sync the PRD and set lifecycle to prototype; there is no separate design-ready gate.
- Keep PRD and route data valid in prototype and later lifecycles. Do not require a design schema or component map.
- New-project scaffolding resolves the slug beneath the canonical project root, initializes `.mlp/project.json`, `versions.json`, `current.json`, and `access.json`, uses npm with `package-lock.json`, and runs the static review before reporting success.

- Keep the new-product template free of business examples. Component demonstrations are optional.
- In a generated product project, expose a component-library page only when the project has meaningful reusable components or combinations beyond the supplied toolkit. Remove or hide an empty, framework-only, or unused project component-library entry from the product directory and UI checklist.
- Remove previous product-specific pages, login methods, memberships, templates, and content when scaffolding a new product.
- Add real pages only after recording them in the current synced PRD.

## Acceptance

- mlp-loop-review.mjs checks PRD, framework integration, registered state coverage and screenshot/annotation contracts. It does not enforce product design choices.
- mlp-runtime-review.mjs checks route rendering and framework availability. DOM overflow, clipping, overlap and contrast diagnostics are advisory. A non-empty product directory that produces zero runtime cases is a technical failure.
- Run the command profile routed by `workflow-routing.md` after changes.
- Framework sync/migration preserves business UI and custom styles/components while updating workbench integration.
