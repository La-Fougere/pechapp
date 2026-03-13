#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/var/www/pechapp.teamgeek.fr/app"
NODE_MAX_OLD_SPACE_SIZE="${NODE_MAX_OLD_SPACE_SIZE:-2048}"

if [ ! -d "${APP_DIR}" ]; then
  echo "App directory not found: ${APP_DIR}"
  exit 1
fi

"${SCRIPT_DIR}/stop.sh"

cd "${APP_DIR}"
export HUSKY=0
export NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE_SIZE}"
npm install
npm run ionic:build

"${SCRIPT_DIR}/run.sh"
