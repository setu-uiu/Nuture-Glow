# ── Stage 1: Install dependencies ──────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Production image ─────────────────────────────────────
FROM node:20-alpine

# Security: run as non-root
RUN apk add --no-cache tini
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove files that should never be in the image
RUN rm -f .env .env.* .dev_jwt_secret

# Create uploads dir with correct ownership
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 4000

ENV NODE_ENV=production

# Use tini to handle PID 1 correctly (signal forwarding)
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/index.js"]
