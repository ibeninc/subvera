#!/usr/bin/env bash
#
# Session startup: install dependencies, run the baseline verification, print the start command.
# If verification fails, fix that before starting any feature work (see AGENTS.md).
#
#   ./init.sh                      install + verify
#   SKIP_BUILD=1 ./init.sh         lint + typecheck only, for a quick re-check mid-session
#   RUN_START_COMMAND=1 ./init.sh  install + verify, then start the dev server

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Same install Vercel runs, so local and deployed builds use identical versions.
INSTALL_CMD=(npm ci --no-audit --no-fund)
# lint + typecheck + production build + route smoke test (scripts/smoke.sh)
VERIFY_CMD=(npm run verify)
QUICK_VERIFY_CMD=(sh -c "npm run lint && npm run typecheck")
START_CMD=(npm run dev)

echo "==> Working directory: $PWD"
echo "==> Node $(node --version) (needs >= 20.9)"

# npm ci wipes node_modules, so only reinstall when the lockfile has changed since the last install.
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "==> Installing dependencies"
  "${INSTALL_CMD[@]}"
else
  echo "==> Dependencies up to date"
fi

if [ "${SKIP_BUILD:-0}" = "1" ]; then
  echo "==> Running quick verification (lint + typecheck)"
  "${QUICK_VERIFY_CMD[@]}"
else
  echo "==> Running baseline verification"
  "${VERIFY_CMD[@]}"
fi

echo "==> Startup command"
printf '    %q' "${START_CMD[@]}"
printf '    # http://localhost:3000\n'

if [ "${RUN_START_COMMAND:-0}" = "1" ]; then
  echo "==> Starting the app"
  exec "${START_CMD[@]}"
fi

echo "Set RUN_START_COMMAND=1 if you want init.sh to launch the app directly."
