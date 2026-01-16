# syntax=docker/dockerfile:1

############################
# Stage 1: Build client + install server deps
############################
FROM node:20-alpine AS builder

WORKDIR /app

# ---------- CLIENT (Vite React) ----------
WORKDIR /app/client

# Copy only package files first to leverage Docker cache
COPY client/package*.json ./
RUN npm ci

# Copy the rest of the client source and build
COPY client/ .
# "build": "tsc && vite build" -> outputs to ../server/public
RUN npm run build

# ---------- SERVER ----------
WORKDIR /app/server

# Copy only server package files and install prod deps
COPY server/package*.json ./
RUN npm ci --omit=dev   # or: npm ci --only=production

# Copy the rest of the server source code
COPY server/ .

############################
# Stage 2: Production image
############################
FROM node:20-alpine

# App will live in /app/server
WORKDIR /app/server

# Copy server code + node_modules + built public/ from builder
# (remember: Vite already wrote to /app/server/public in the builder stage)
COPY --from=builder /app/server ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/index.js"]
