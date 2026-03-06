# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Run migrations then start (migration:run exits 0 if none pending)
CMD ["sh", "-c", "node node_modules/typeorm/cli.js migration:run -d dist/config/database.js; node dist/index.js"]
