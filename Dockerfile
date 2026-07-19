# ---- Etapa 1: dependencias y build ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: dependencias de producción únicamente ----
FROM node:20-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

# ---- Etapa 3: imagen final, mínima ----
FROM node:20-alpine AS runner

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
