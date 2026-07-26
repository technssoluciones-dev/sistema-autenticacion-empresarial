# --- STAGE 1: Dependencies ---
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- STAGE 2: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --production

# --- STAGE 3: Production Runner ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]