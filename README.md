# MLP Prototype Studio

MLP Prototype Studio is a Codex skill and framework for creating mobile C-end low-fidelity prototype workspaces.

It provides:

- isolated prototype projects under `~/Documents/Codex/mlp-projects`
- a reusable review workspace with project settings, page directory, mobile prototype, Product Notes, and Test Cases
- fixed low-fidelity visual standards and reusable phone UI patterns
- framework sync and review scripts for existing projects
- local preview and static deployment workflow
- project center, version metadata, rollback pointer, and access metadata helpers

## Skill Alias

Use `mlp` in Codex to invoke the workflow.

## Main Scripts

```bash
# Create a new project
scripts/scaffold-framework-project.sh <project-slug>

# Refresh an existing project to the latest framework guards
scripts/refresh-project.sh <project-slug-or-path>

# Safely migrate a legacy project toward the layered source layout
scripts/migrate-project-to-layered.sh <project-slug-or-path>

# Generate the local project center
scripts/mlp-center.sh

# Create/list/rollback static releases
scripts/mlp-version.sh release <project-slug-or-path>
scripts/mlp-version.sh list <project-slug-or-path>
scripts/mlp-version.sh rollback <project-slug-or-path> <version>

# Configure access metadata
scripts/mlp-access.sh show <project-slug-or-path>
```

## Repository Layout

```text
SKILL.md
agents/
assets/
  framework-template/
  current-workbench-template/
references/
scripts/
```

`assets/framework-template/` is the source template for new projects. Runtime dependencies, build output, and release snapshots are intentionally ignored by Git.

