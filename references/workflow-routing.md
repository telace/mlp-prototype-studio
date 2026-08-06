# MLP Workflow Routing And Command Profiles

Use this reference to keep `mlp` work context-light. Load only the references needed for the current task.

## Current Project Resolution

- When the user says `当前项目`, `这个项目`, `执行完整文档输出`, `更新框架`, `部署`, or omits a project path, first check whether the current working directory is an MLP project by looking for `package.json` and `src/project/project-data.js`.
- If the current working directory is an MLP project, run commands in `.` and do not ask for a project path.
- If the current working directory is not an MLP project, resolve the most recent explicit MLP project path from the conversation only when it is unambiguous.
- If neither is available, ask for the project slug or path. Do not guess among multiple projects under `<MLP_PROJECT_ROOT>`.
- For interaction documentation requests, open the local workbench and use manual element or coordinate annotations. Automatic interaction-document generation is temporarily disabled.

## Scenario Routing

- **New project initialization:** use `assets/framework-template/`, then read `template-contract.md` only if project structure is unclear.
- **New product flow or material redesign:** read `prototype-design.md`, complete `src/project/design.js`, explore 2-3 layout concepts for key pages, then implement only the selected direction.
- **Ordinary prototype page edit:** edit only project content under `src/pages/`, `src/project/`, and page-level styles. Preserve the accepted `designContract`. Read `visual-standard.md` and `component-patterns.md` only when changing visual style or components.
- **Interaction notes:** create them manually in the workbench. Prefer element anchors for stable components and coordinate anchors for unbound regions. Notes remain page/state aware.
- **Framework sync or framework bug:** read `framework-refresh.md`; update `assets/framework-template/`, sync scripts, and review scripts together.
- **Legacy project migration:** prefer rebuild-on-current-framework when old structure conflicts with the current framework. Use migration scripts only when preserving code is materially cheaper than rebuilding.
- **Deployment:** read `deployment.md`; create or select a release before online deployment so `public/changelog.json` is generated from release metadata, then deploy a project-isolated `dist/` to its own server subdirectory. Local preview/build must not generate changelog entries.
- **Version/access/project center:** use bundled scripts first; do not hand-roll state files unless a script is missing.

## Command Profiles

- `npm run mlp:fast-check`: static MLP review plus production build. Use after ordinary copy, layout, component usage, notes, and page-level style edits.
- `npm run mlp:annotation-acceptance`: validate manually saved element and coordinate annotations, including page/state ownership, anchor data, title, and description. Automatic interaction-document generation is temporarily disabled.
- `npm run mlp:route-check`: fast check plus browser runtime review. Use after changing routes, page states, login flows, directory entries, state switches, or panel behavior.
- `npm run mlp:acceptance`: route check plus manual annotation acceptance. This is the default complete non-visual validation and must not run `mlp:visual-review`.
- `npm run mlp:visual-acceptance`: acceptance plus visual review. Use only when the user explicitly asks for `视觉验收`, `视觉检查`, `截图验收`, `更新视觉基线`, or an equivalent explicit visual-review command.
- `npm run mlp:visual-snapshot`: create screenshots without gating. Use only when explicitly requested for visual evidence.
- `npm run mlp:visual-review -- --update-baseline`: update expected screenshots only after the user explicitly accepts the visual change.
- `npm run mlp:release -- --title "..." --summary "..."`: create an online-ready version and generate `public/changelog.json`. Do not use this for ordinary local preview.
- `npm run mlp:export-ai`: export a non-image AI handoff Markdown file to `exports/ai-handoff.md` and `public/ai-handoff.md`. Use when the user wants another AI to understand the prototype without executing JS. The export includes project info, page directory, page states/routes, text layout tree, interaction mapping, Product Notes, Test Cases, and `checked` status. This command is non-visual and must not create screenshots.

## Verification Routing

- All prototype, framework, migration, rebuild, documentation, local preview, deployment preparation, and handoff checks are non-visual by default. Do not run `mlp:visual-review`, `mlp:visual-snapshot`, or any screenshot-producing command unless the user explicitly asks for visual review.
- Ordinary prototype edits, such as copy, spacing, a single button, one card, one page layout adjustment, or page-level style changes: run `npm run mlp:fast-check`.
- Route, page-state, login-flow, directory, state-switch, or right-panel behavior changes: run `npm run mlp:route-check`.
- Manual annotation review after explicit design confirmation: run `npm run mlp:annotation-acceptance` and `npm run mlp:route-check`. These checks must not create visual snapshots.
- AI handoff export: run `npm run mlp:export-ai`. It is a read/export operation and should not mutate prototype source files except `exports/ai-handoff.md` and `public/ai-handoff.md`.
- Framework refresh for an existing project: run the refresh wrapper or `npm run mlp:route-check` by default. Use `npm run mlp:acceptance` for complete non-visual validation.
- Visual review is explicit-only. Trigger it only when the user directly says `视觉验收`, `视觉检查`, `截图验收`, `跑 visual-review`, `更新视觉基线`, or asks for screenshots as evidence. Do not infer visual review from `上线/部署`, `交付`, `迁移`, `重构`, `完整检查`, or `验收` unless the wording includes visual/screenshot/baseline.

## Token Discipline

- Do not read every reference for every task. Read the matching scenario reference only.
- Do not paste full command output unless the user asks; summarize pass/fail and actionable errors.
- During layout iteration, keep Product Notes minimal. Expand Product Notes and Test Cases only after explicit page or project finalization.
- Prefer scripts and template assets over recreating framework code from memory.
- If a project fails framework review, fix the framework layer through sync or rebuild before continuing business-page edits.
