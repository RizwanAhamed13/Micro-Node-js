# One image recipe for every service. Pick the service at build time:
#   docker build --build-arg SERVICE=06-stock-aggregation -t stocks .

# #region Multi-Stage Build
# Stage 1: install production dependencies only.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY logging-middleware/package.json logging-middleware/
RUN npm ci --omit=dev --ignore-scripts

# Stage 2: a clean image with just node_modules + the code that runs.
FROM node:22-alpine
ARG SERVICE
ENV SERVICE=${SERVICE} NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json mock-upstream.js ./
COPY --chown=node:node shared ./shared
COPY --chown=node:node logging-middleware ./logging-middleware
COPY --chown=node:node ${SERVICE} ./${SERVICE}
# #endregion

# #region Run Safely
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1
CMD ["sh", "-c", "node ${SERVICE}/server.js"]
# #endregion
