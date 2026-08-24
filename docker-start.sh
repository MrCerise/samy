#!/bin/sh
set -e

echo "Applying database migrations..."
bunx prisma migrate deploy

echo "Starting Samy..."
exec bun run src/index.ts
