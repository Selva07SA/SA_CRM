#!/bin/sh
set -eu

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting API..."
node dist/src/server.js
