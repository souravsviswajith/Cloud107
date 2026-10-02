# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/src/db/drizzle.config.ts ./src/db/drizzle.config.ts
COPY --from=build /app/src/db/schema.ts ./src/db/schema.ts
COPY --from=build /app/src/types.ts ./src/types.ts

EXPOSE 3000

USER node

CMD ["node", "dist/server.cjs"]
