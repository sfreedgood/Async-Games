# syntax=docker/dockerfile:1.7

FROM node:lts-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY apps/async-games-backend/dist/package.json ./package.json
COPY apps/async-games-backend/dist/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

COPY apps/async-games-backend/dist ./

EXPOSE 3000

CMD ["node", "main.js"]