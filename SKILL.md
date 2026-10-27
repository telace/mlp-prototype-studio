---
name: mobile-lowfi-prototype
description: "Build reusable mobile C-end product-manager workflows that update an in-project PRD before every prototype change, then produce consistent clickable prototypes, manual annotations, verified previews, and optional static deployments. Alias: mlp. Use when creating, changing, reviewing, migrating, or deploying an MLP mobile prototype."
---

# Mobile Low-fi Prototype

Treat `mlp` as this workflow. Read `references/constraint-map.md` first for rule ownership and precedence, then load only the reference routed by `references/workflow-routing.md`.

## Resolve The Project

Use the current directory when it contains `package.json` and `src/project/project-data.js`. Otherwise use the latest unambiguous explicit MLP project path. Ask for the path only when neither is available.

Keep every project isolated under its own directory, local preview, build, release history, deployment path, and access configuration.

## Workflow Gates

For a new product, feature, flow, or material redesign:

1. Initialize through `scripts/scaffold-framework-project.mjs <project-slug>` without designing business pages. New MLP projects always live under `${MLP_PROJECT_ROOT:-~/Documents/Codex/mlp-projects}/<project-slug>/`; never scaffold them into a conversation workspace or `outputs/`. The scaffold creates the project identity, clean draft PRD, `discovery` lifecycle metadata, npm contract, and runs its static self-review.
2. Read `references/prd-standard.md`; discuss the problem, goals/non-goals, users, journey, scope, rules, data, states, constraints, and acceptance criteria one coherent topic group at a time.
3. Discuss information architecture, navigation, content priority, design principles, references, and materially different directions for key pages.
4. Before every prototype change, update `docs/PRD.md` first. Record even small copy, layout, or component changes in the affected requirement/acceptance section and change log. Keep facts, assumptions, and open questions distinct, then set `designContract.prd.status` to `synced` for that PRD version.
5. Continue directly to prototype implementation without an intermediate human-confirmation gate. Ask only when unresolved product ambiguity makes a safe PRD update impossible.
6. Read `references/prototype-design.md` and `references/visual-standard.md`; design from the synced PRD using the PixVerse reference's visual hierarchy, component detail, purposeful motion and coordinated state feedback. Design notes are optional.
7. If implementation reveals another scope, journey, behavior, rule, data, permission, or acceptance change, update the PRD again before implementing that change.

## Prototype Implementation

- Use `references/visual-standard.md` as the single prototype quality guide. It replaces the previous design constraints with reference-based visual and interaction guidance; content, layout, palette and component choice remain product-specific.
- For component states, transitions, overlays or simulated tasks, read `references/component-patterns.md` for implementation recipes. `prototype-ui` is optional; native controls, custom components, project CSS and project tokens are allowed.
- Preserve the workbench integration, fixed UI checklist/prompt entries and annotation anchors described in `references/template-contract.md`.
- Reference values illustrate proportions and timing, not mandatory scales or design approval gates. Do not add component registration, CSS whitelists or numerical design quotas.

## Existing Project Edits

Before editing a page, read `src/project/notes/local-edits.json`.

Process pending `elementDeletions` for the affected page/state before new edits: remove the stable element and its unused imports, styles, mock data, annotations, Product Notes, and tests; then mark it `applied`. Mark ambiguous shared-component deletion as `conflict`. Never recreate pending/applied deleted elements without explicit restoration.

Preserve checked human documentation. AI edits, rebuilds, migrations, and syncs may add missing entries or fill empty fields but must not overwrite checked text unless explicitly requested.

For ordinary page edits, change project content, page appearance and layout as needed. If the request requires changing protected workbench behavior, template structure, shared components, or guards, treat it as a framework change and read `references/framework-refresh.md`.

## Annotation And Documentation Gate

Do not auto-generate interaction documentation during design iteration.

Use the local workbench for manual element or coordinate annotations. Save through the local dev API into `src/project/notes/local-edits.json`; static builds remain read-only. Element anchors require stable IDs. Coordinate anchors use the logical canvas defined by `template-contract.md`.

Only after the user explicitly confirms the whole prototype or named pages, complete Product Notes and Test Cases for that scope. This finalization confirmation does not block ordinary PRD-first prototype iteration. Page status becomes approved only after explicit finalization confirmation.

## Verification

Use the required profile:

- Pure PRD, copy, or data changes: `npm run mlp:fast-check`.
- Routes, page states, directory, login flow, or workbench panel behavior: `npm run mlp:route-check`.
- Manual annotation data: `npm run mlp:annotation-acceptance`.
- Complete non-visual acceptance: `npm run mlp:acceptance`.
- AI handoff: `npm run mlp:export-ai`.

Inspect affected UI after visual work and exercise the changed interaction path, including its initial and final states, as described in `references/visual-standard.md`. Report anything not actually verified. Use screenshot comparison when requested or useful; it is not a mandatory design approval gate. Automated checks protect framework and data integrity, not a preferred composition or visual style.

After UI work, build and provide a local preview by default. Read `references/deployment.md` before release, deployment, rollback, access, or server changes. Never overwrite another project's deployment directory.

## Iteration

```text
Request -> update visible PRD -> prototype change -> verification -> explicit prototype/page finalization -> manual delivery details -> optional deployment
```
