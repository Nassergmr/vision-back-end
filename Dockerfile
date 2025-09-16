# syntax=docker/dockerfile:1

# ------------------
# Base Image
# ------------------
ARG NODE_VERSION=22.16.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js/Prisma"
WORKDIR /app
ENV NODE_ENV="production"

# ------------------
# Build Stage
# ------------------
FROM base AS build

# Install build tools
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build app
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# ------------------
# Final Stage
# ------------------
FROM base

# Install runtime dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built app from build stage
COPY --from=build /app /app

# Expose port
EXPOSE 3000

# Use a prestart script to ensure Prisma client is generated if needed at runtime
CMD ["npm", "run", "start"]
