FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/storefront/package*.json ./apps/storefront/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the backend
RUN npm run build --filter=@dtc/backend

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app/apps/backend

# Copy built app and dependencies
COPY --from=builder /app /app

EXPOSE 9000

CMD ["npx", "medusa", "start"]
