#!/usr/bin/env bash
set -euo pipefail

PORT="3001"
PATTERN="vite.*--port ${PORT}"

get_pids() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"${PORT}" -sTCP:LISTEN || true
    return
  fi

  pgrep -f "${PATTERN}" || true
}

PIDS="$(get_pids)"

if [ -z "${PIDS}" ]; then
  echo "No app process found on port ${PORT}."
  exit 0
fi

echo "Stopping app process(es): ${PIDS}"
kill ${PIDS} || true

for _ in {1..10}; do
  if [ -z "$(get_pids)" ]; then
    exit 0
  fi
  sleep 1
done

echo "Force stopping remaining process(es)."
kill -9 ${PIDS} || true
