#!/usr/bin/env bash
# dev.sh — helper to run the project in development
# Usage: ./dev.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "Starting local dev helper..."

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
  echo "node_modules not found — installing dependencies (npm ci)"
  npm ci
fi

echo "Running dev server (npm run dev). Use Ctrl+C to stop."
exec npm run dev
