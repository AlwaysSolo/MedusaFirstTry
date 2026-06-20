FROM node:20-alpine

WORKDIR /app

# ── Key optimisation: skip the Medusa admin-dashboard Vite build ──
# The admin UI is a heavy React/Vite bundle that can take 15+ minutes.
# Set this to "true" so `medusa build` only compiles the server-side code.
ENV DISABLE_MEDUSA_ADMIN=true

# Copy workspace root files needed by npm ci
COPY package.json package-lock.json ./

# Copy .npmrc if it exists (has auto-install-peers=true)
COPY .npmrc ./

# Copy workspace package.json files so npm can resolve the workspace graph.
# The storefront package.json is needed for npm ci to succeed (workspace
# references must resolve), but we never copy the storefront *source*.
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

# Install dependencies
RUN npm ci

# Copy ONLY the backend source code – not the storefront
COPY apps/backend/ ./apps/backend/

# Build the backend (TypeScript compile + module discovery).
# Because DISABLE_MEDUSA_ADMIN=true the admin dashboard is skipped.
WORKDIR /app/apps/backend
RUN npx medusa build

EXPOSE 9000

CMD ["npx", "medusa", "start"]
