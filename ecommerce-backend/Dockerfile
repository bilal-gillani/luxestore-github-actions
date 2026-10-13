# ---- Build stage: install production dependencies ----
FROM node:24-alpine3.23 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runtime stage: no npm, no yarn, non-root ----
FROM node:24-alpine3.23
WORKDIR /app
ENV NODE_ENV=production

# Patch OS packages, then remove package managers not needed at runtime
RUN apk upgrade --no-cache \
    && rm -rf /usr/local/lib/node_modules/npm \
              /usr/local/lib/node_modules/corepack \
              /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
              /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node
EXPOSE 3000
CMD ["node", "server.js"]