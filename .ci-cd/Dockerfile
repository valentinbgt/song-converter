# Image de Départ
FROM node:24 AS builder

# Create and set working directory
WORKDIR /app

ARG CACHEBUST
# Clone the repository
COPY . .

# Install dependencies and build
RUN npm ci
RUN npx prisma generate
RUN npm run build


FROM node:24-alpine

WORKDIR /app

# Copy the built output
COPY --from=builder /app/.output /app

# Copy prisma files needed for migrations
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/node_modules/prisma /app/node_modules/prisma
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/prisma.config.ts /app/prisma.config.ts
COPY --from=builder /app/generated/prisma /app/generated/prisma

# Expose default Nuxt port
EXPOSE 3000

# Start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node /app/server/index.mjs"]