FROM node:20-alpine

WORKDIR /app

# ── Skip the Medusa admin dashboard Vite build (saves 10+ min) ──
ENV DISABLE_MEDUSA_ADMIN=true

# Copy ONLY the backend package.json — treat it as a standalone project,
# completely bypassing the monorepo workspace and its 1 MB lockfile.
# This means npm only resolves ~14 direct deps instead of the entire
# monorepo (backend + storefront + devDeps of both).
COPY apps/backend/package.json ./

# Install backend deps only.  Uses `npm install` (not `npm ci`) because
# we intentionally skip the monorepo lockfile.
RUN npm install --legacy-peer-deps

# Copy backend source, config, and tsconfig
COPY apps/backend/ ./

# Compile server-side TypeScript (admin build skipped via env var above)
RUN npx medusa build

EXPOSE 9000

CMD ["npx", "medusa", "start"]
