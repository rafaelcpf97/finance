# Stage 1: Build React frontend and install server dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy client files and install dependencies
COPY client/package.json client/package-lock.json* ./client/
WORKDIR /app/client
RUN npm ci

# Copy client source and build
COPY client/ .
RUN npm run build

# Install server dependencies
WORKDIR /app
COPY server/package.json server/package-lock.json* ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Copy server source code first
COPY server/ ./server/

# Copy server dependencies
COPY --from=builder /app/server/node_modules ./server/node_modules

# Copy built React app to server/public
COPY --from=builder /app/client/dist ./server/public

# Set working directory to server
WORKDIR /app/server

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
CMD ["node", "src/index.js"]
