# MLP Framework Refresh

Use this reference for updating the review workbench or migrating its integration. Product design is governed only by visual-standard.md.

## Scope

Preserve product pages, routes, copy, custom components, styles, design notes, human annotations and deletion records. Updating the workbench is not permission to redesign the product or convert native/custom controls to prototype-ui.

Preserve the framework behaviors in template-contract.md: project isolation, PRD entry, fixed UI checklist and prompt sections, phone/state-toolbar alignment, screenshot content boundaries, annotation editing/conflict protection, panel-local scrolling and update feedback.

## Commands

Resolve the project below MLP_PROJECT_ROOT or ~/Documents/Codex/mlp-projects unless the user specifies its existing path.

- Normal refresh: scripts/refresh-project.sh <project-slug-or-absolute-path>.
- Full framework sync: node scripts/sync-framework-full.mjs <project-path>.
- Targeted legacy guard update: node scripts/sync-framework-guards.mjs <project-path>.
- Full migration with backup and report: scripts/migrate-project-full.sh <project-slug-or-absolute-path>.
- Legacy splitting when needed: scripts/semantic-split-legacy-app.sh <project-slug-or-absolute-path>.

Inspect the target before running a sync: full sync replaces framework-owned files and the bundled prototype-ui. Preserve project extensions to that toolkit before updating; do not overwrite custom work silently. Old design metadata may remain as optional project notes and must not cause validation failures.

## Verification

Run mlp:review, build and mlp:acceptance for the affected framework integration. The prebuild script runs the framework/PRD review before writing version.json. Runtime exceptions and broken workbench/data integration are failures. Page styles, raw colors, custom controls, layout choices and the absence of old design schemas are not failures.

Use --visual-acceptance on the refresh wrapper or mlp:visual-review when screenshot comparison is requested or useful. It is not mandatory for every change. Preserve accepted baselines and inspect expected differences before replacing one.

The full migration tool retains a timestamped backup and reports under .mlp/migration/reports. Do not hand off a broken migration; report unresolved technical integration issues and preserve the source.

## Maintaining The Skill

Keep assets/framework-template, sync scripts and review scripts aligned. Design defaults in existing components are implementation examples, not mandatory geometry or palette. New checks must not reintroduce retired component registration, CSS/property quotas, fixed visual values or layout recipes.
