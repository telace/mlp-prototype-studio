#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Deprecated: use scaffold-framework-project.sh instead." >&2
exec "$SCRIPT_DIR/scaffold-framework-project.sh" "$@"
