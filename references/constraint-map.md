# MLP Constraint Map

This file defines rule ownership. A constraint must have one canonical narrative owner and, where practical, one executable check.

## Precedence

When rules appear inconsistent, apply this order:

1. Explicit current user instruction.
2. Current synced project PRD and `designContract` for project-specific product/design decisions.
3. This ownership map and the canonical domain contract named below.
4. Framework template implementation and automated checks.
5. Examples, legacy compatibility notes, and old project code.

Do not preserve a lower-priority rule that conflicts with a higher-priority rule. Fix or remove the stale copy.

## Canonical Ownership

| Domain | Canonical owner | Contains | Must not contain |
|---|---|---|---|
| Workflow and gates | `SKILL.md` | Project resolution, PRD/prototype/documentation gates, verification routing | Pixel values, component CSS, deployment commands in detail |
| Scenario routing | `workflow-routing.md` | Which reference/command profile to load | Duplicate domain rules |
| Product requirements | `prd-standard.md` | Discovery topics, PRD schema/status/change control | Visual/component implementation |
| Design reasoning | `prototype-design.md` | Product-led composition and reference-driven design process | Workbench dimensions, deployment, annotation storage |
| Prototype design quality | `visual-standard.md` | Visual hierarchy, component detail, purposeful motion, coordinated feedback and experiential review | Component code, mandatory numeric scales, workbench documentation behavior |
| Prototype implementation recipes | `component-patterns.md` | Optional components, shared state, transition lifecycle and task feedback implementation | Independent design policy, token scales or page-directory rules |
| Framework/project structure | `template-contract.md` | Protected shell, file/data boundaries, dynamic vs fixed areas, compatibility | Product design heuristics, full component style guide |
| Framework migration | `framework-refresh.md` | Sync/rebuild/migration procedure and acceptance | Ordinary page-edit rules |
| Deployment/releases | `deployment.md` | Build, release, server isolation, access and rollback | Prototype visual/design rules |
| Executable enforcement | Template scripts/components/CSS | Deterministic constraints and acceptance | New policy not documented by a canonical owner |

## Cross-Domain Decisions

- The PRD owns product scope and behavior and is updated before every prototype change. design notes are optional and do not create a second approval gate.
- Projects choose their content, structure, palette, components and visual values freely. visual-standard.md is the only prototype quality guide, rewritten from the user-selected PixVerse HTML reference. Its example values are not enforced design scales.
- The workbench shell is fixed framework UI. The phone viewport is project UI. Tokens and theme changes never cross that boundary.
- Product Notes and Test Cases own confirmed page/state delivery detail. Manual annotations own local human additions. Neither is a second PRD.
- Legacy compatibility may preserve structure temporarily but never overrides current component, token, security, or isolation contracts.

## Change Procedure

When changing a constraint:

1. Identify its canonical owner from the table.
2. Edit the owner once.
3. Remove or replace duplicate prose elsewhere with a direct reference.
4. Update implementation/checks if the rule is executable.
5. Search the Skill for stale phrases and numeric copies.
6. Run Skill validation, MLP review, annotation acceptance when affected, and production build.

Do not add a new rule to `SKILL.md` merely for visibility. Add it to the owning contract and route to that contract from the workflow.
