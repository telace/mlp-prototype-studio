#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ARG="${1:-}"

if [[ -z "$PROJECT_ARG" ]]; then
  echo "Usage: $0 <project-slug-or-absolute-path>" >&2
  exit 1
fi

if [[ "$PROJECT_ARG" = /* ]]; then
  PROJECT_ROOT="$PROJECT_ARG"
else
  MLP_ROOT="${MLP_PROJECT_ROOT:-$HOME/Documents/Codex/mlp-projects}"
  PROJECT_ROOT="$MLP_ROOT/$PROJECT_ARG"
fi

if [[ ! -f "$PROJECT_ROOT/package.json" || ! -f "$PROJECT_ROOT/src/styles.css" ]]; then
  echo "Not an MLP project: $PROJECT_ROOT" >&2
  exit 1
fi

echo "Refreshing MLP framework: $PROJECT_ROOT"
node "$SKILL_ROOT/scripts/sync-framework-guards.mjs" "$PROJECT_ROOT"

cd "$PROJECT_ROOT"

if [[ ! -d node_modules ]]; then
  npm install --cache .npm-cache
fi

npm run mlp:review
npm run build

echo "MLP framework refresh complete: $PROJECT_ROOT"
