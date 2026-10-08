#!/bin/sh
set -eu
node backend-dist/scripts/validate-container.js
if [ "${MIGRATE_ON_START:-true}" = "true" ]; then
  ./node_modules/.bin/prisma migrate deploy
  node backend-dist/prisma/seed.js
fi
exec node backend-dist/server/index.js
