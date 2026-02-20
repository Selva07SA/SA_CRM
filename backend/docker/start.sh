#!/bin/sh
set -eu

# Fallback for platforms where DIRECT_URL is not set explicitly.
if [ -z "${DIRECT_URL:-}" ]; then
  export DIRECT_URL="${DATABASE_URL:-}"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting API..."
node dist/src/server.js
