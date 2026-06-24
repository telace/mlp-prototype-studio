#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: scaffold-framework-project.sh <project-slug-or-target-directory> [--force-current-project]" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="${MLP_PROJECT_ROOT:-$HOME/Documents/Codex/mlp-projects}"
TARGET_INPUT="$1"
FORCE=""
TEMPLATE_NAME="framework-template"

for arg in "${@:2}"; do
  case "$arg" in
    --force-current-project)
      FORCE="$arg"
      ;;
    --full-current-template)
      TEMPLATE_NAME="current-workbench-template"
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

case "$TARGET_INPUT" in
  /*)
    TARGET_DIR="$TARGET_INPUT"
    ;;
  */*)
    TARGET_DIR="$(pwd)/$TARGET_INPUT"
    ;;
  *)
    TARGET_DIR="$PROJECT_ROOT/$TARGET_INPUT"
    ;;
esac

TEMPLATE_DIR="$SKILL_DIR/assets/$TEMPLATE_NAME"

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "Template directory not found: $TEMPLATE_DIR" >&2
  exit 1
fi

if [ -d "$TARGET_DIR" ] && [ -n "$(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -print -quit)" ] && [ "$FORCE" != "--force-current-project" ]; then
  echo "Refusing to scaffold into non-empty directory: $TARGET_DIR" >&2
  echo "Choose a new project directory. Use --force-current-project only when intentionally refreshing the active project shell." >&2
  exit 2
fi

mkdir -p "$TARGET_DIR"
rsync -a \
  --exclude node_modules \
  --exclude dist \
  --exclude .npm-cache \
  --exclude .playwright-cli \
  --exclude .DS_Store \
  "$TEMPLATE_DIR/" "$TARGET_DIR/"

echo "Created prototype from $TEMPLATE_NAME: $TARGET_DIR"
