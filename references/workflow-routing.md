# MLP Workflow Routing And Command Profiles

Use this reference to keep `mlp` work context-light. Load only the references needed for the current task.

## Current Project Resolution

- When the user says `当前项目`, `这个项目`, `执行完整文档输出`, `更新框架`, `部署`, or omits a project path, first check whether the current working directory is an MLP project by looking for `package.json` and `src/project/project-data.js`.
- If the current working directory is an MLP project, run commands in `.` and do not ask for a project path.
- If the current working directory is not an MLP project, resolve the most recent explicit MLP project path from the conversation only when it is unambiguous.
- If neither is available, ask for the project slug or path. Do not guess among multiple projects under `<MLP_PROJECT_ROOT>`.
- For short user prompts such as `调用 mlp，执行完整文档输出`, treat it as current-project work and run `npm run mlp:docs-complete` in the resolved project.

## Scenario Routing

- **New project initialization:** use `assets/framework-template/`, then read `template-contract.md` only if project structure is unclear.
- **Ordinary prototype page edit:** edit only project content under `src/pages/`, `src/project/`, and page-level styles. Read `visual-standard.md` and `component-patterns.md` only when changing visual style or components.
- **Product Notes or Test Cases:** do not generate during prototype design. After the user confirms the page or scope is finalized, run `npm run mlp:generate-docs` to create a draft, then review and merge confirmed entries into Product Notes. Notes and cases must be state-aware and element-linked.
- **Framework sync or framework bug:** read `framework-refresh.md`; update `assets/framework-template/`, sync scripts, and review scripts together.
- **Legacy project migration:** prefer rebuild-on-current-framework when old structure conflicts with the current framework. Use migration scripts only when preserving code is materially cheaper than rebuilding.
- **Deployment:** read `deployment.md`; create or select a release before online deployment so `public/changelog.json` is generated from release metadata, then deploy a project-isolated `dist/` to its own server subdirectory. Local preview/build must not generate changelog entries.
- **Version/access/project center:** use bundled scripts first; do not hand-roll state files unless a script is missing.

## Command Profiles

- `npm run mlp:fast-check`: static MLP review plus production build. Use after ordinary copy, layout, component usage, notes, and page-level style edits.
- `npm run mlp:generate-docs`: scan `bindInteraction`/`bindElement` and write missing Product Notes draft entries to `src/project/notes/generated-draft.js`. Use only after explicit design confirmation or explicit user request for a documentation draft. Generated entries are `reviewed: false` and must not be treated as delivery-ready.
- `npm run mlp:docs-complete`: shorthand validation flow for finalized documentation. It runs document draft generation, prototype documentation acceptance, and route check. If generated draft contains missing entries, Codex must review and merge confirmed entries into `src/project/notes/interactions.js` before rerunning this command.
- `npm run mlp:route-check`: fast check plus browser runtime review. Use after changing routes, page states, login flows, directory entries, state switches, or panel behavior.
- `npm run mlp:prototype-acceptance`: strict prototype delivery review. It checks that every `bindInteraction` and `bindElement` prototype element has matching Product Notes documentation, every documented element has a prototype source, each page state has notes, action/content fields are complete, content elements declare `dataSource`, and every element note has editor confirmation with `reviewed: true`.
- `npm run mlp:acceptance`: route check plus prototype acceptance. This is the default complete non-visual validation and must not run `mlp:visual-review`.
- `npm run mlp:visual-acceptance`: acceptance plus visual review. Use only when the user explicitly asks for `视觉验收`, `视觉检查`, `截图验收`, `更新视觉基线`, or an equivalent explicit visual-review command.
- `npm run mlp:visual-snapshot`: create screenshots without gating. Use only when explicitly requested for visual evidence.
- `npm run mlp:visual-review -- --update-baseline`: update expected screenshots only after the user explicitly accepts the visual change.
- `npm run mlp:release -- --title "..." --summary "..."`: create an online-ready version and generate `public/changelog.json`. Do not use this for ordinary local preview.

## Verification Routing

- All prototype, framework, migration, rebuild, documentation, local preview, deployment preparation, and handoff checks are non-visual by default. Do not run `mlp:visual-review`, `mlp:visual-snapshot`, or any screenshot-producing command unless the user explicitly asks for visual review.
- Ordinary prototype edits, such as copy, spacing, a single button, one card, one page layout adjustment, or page-level style changes: run `npm run mlp:fast-check`.
- Route, page-state, login-flow, directory, state-switch, or right-panel behavior changes: run `npm run mlp:route-check`.
- Documentation output after explicit design confirmation: run `npm run mlp:docs-complete`. This is a documentation/route check and must not create visual snapshots.
- Framework refresh for an existing project: run the refresh wrapper or `npm run mlp:route-check` by default. Use `npm run mlp:acceptance` for complete non-visual validation.
- Visual review is explicit-only. Trigger it only when the user directly says `视觉验收`, `视觉检查`, `截图验收`, `跑 visual-review`, `更新视觉基线`, or asks for screenshots as evidence. Do not infer visual review from `上线/部署`, `交付`, `迁移`, `重构`, `完整检查`, or `验收` unless the wording includes visual/screenshot/baseline.

## Token Discipline

- Do not read every reference for every task. Read the matching scenario reference only.
- Do not paste full command output unless the user asks; summarize pass/fail and actionable errors.
- During layout iteration, keep Product Notes minimal. Expand Product Notes and Test Cases only after explicit page or project finalization.
- Prefer scripts and template assets over recreating framework code from memory.
- If a project fails framework review, fix the framework layer through sync or rebuild before continuing business-page edits.
