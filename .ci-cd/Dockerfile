# Image de Départ
FROM node:23 AS builder

# Create and set working directory
WORKDIR /app

ARG CACHEBUST
# Clone the repository
COPY . .

# Install dependencies and build
RUN npm ci
RUN npm run build


FROM node:23-alpine

WORKDIR /app

COPY --from=builder /app/.output /app

# Expose default Nuxt port
EXPOSE 3000

# Start the server
CMD ["node", "/app/server/index.mjs"]