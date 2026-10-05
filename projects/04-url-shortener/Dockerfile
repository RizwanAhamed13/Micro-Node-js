# #region Basic Dockerfile
# Build from projects/:  docker build -f 04-url-shortener/Dockerfile -t url-shortener .
FROM node:22-alpine
WORKDIR /app

# 1. dependencies first, so this layer is cached until package files change
COPY package*.json ./
COPY logging-middleware/package.json logging-middleware/
RUN npm ci --omit=dev --ignore-scripts

# 2. then the code
COPY shared ./shared
COPY logging-middleware ./logging-middleware
COPY 04-url-shortener ./04-url-shortener

ENV PORT=5000
EXPOSE 5000
CMD ["node", "04-url-shortener/server.js"]
# #endregion
