#!/usr/bin/env bash
# Ubuntu/Linux only. All mutations share the same kernel-held lock.
set -euo pipefail
if [[ $# -lt 2 ]]; then
  echo 'Usage: release.sh <init|deploy|rollback|deactivate> SITE_ROOT [arguments]' >&2
  exit 2
fi
[[ "$(uname -s)" == Linux ]] || { echo 'Release actions require Linux; no changes made.' >&2; exit 1; }
command -v flock >/dev/null || { echo 'Install util-linux (flock).' >&2; exit 1; }
command -v python3 >/dev/null
TS_SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TS_ACTION="$1"
TS_TARGET_ROOT="$2"
shift 2
python3 "$TS_SCRIPT_DIR/release.py" check-root "$TS_TARGET_ROOT"
exec 9>"$TS_TARGET_ROOT/.deploy.lock"
flock -n 9 || { echo 'Another release action holds the lock.' >&2; exit 1; }
python3 "$TS_SCRIPT_DIR/release.py" "$TS_ACTION" "$TS_TARGET_ROOT" "$@"
