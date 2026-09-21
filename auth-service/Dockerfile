# 1. Use official lightweight Node.js LTS Alpine image
FROM node:20-alpine

# 2. Set working directory inside the container
WORKDIR /usr/src/app

# 3. Set default production environment variable
ENV NODE_ENV=production
ENV PORT=5001

# 4. Copy package manifests first to leverage Docker layer caching
COPY --chown=node:node package*.json ./

# 5. Install production-only dependencies deterministically and clean npm cache
RUN npm ci --omit=dev && npm cache clean --force

# 6. Copy remaining application source code with non-root ownership
COPY --chown=node:node . .

# 7. Switch from root to unprivileged 'node' user for security hardening
USER node

# 8. Expose Auth Service HTTP port
EXPOSE 5001

# 9. Use exec form of CMD to ensure proper Unix signal handling (SIGINT/SIGTERM)
CMD ["node", "src/server.js"]
