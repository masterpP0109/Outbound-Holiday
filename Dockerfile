# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci
COPY server ./server
COPY shared ./shared
COPY scripts ./scripts
COPY prisma ./prisma
COPY src/types ./src/types
COPY src/types.ts ./src/types.ts
COPY tsconfig.json ./
RUN npm run build:api && npm prune --omit=dev --ignore-scripts

FROM base AS runtime
ENV NODE_ENV=production PORT=10000
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/backend-dist ./backend-dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --chown=node:node docker/start.sh ./docker/start.sh
RUN mkdir -p /app/docs /app/.local && chown node:node /app/docs /app/.local && chmod 755 /app/docker/start.sh
USER node
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["/app/docker/start.sh"]
