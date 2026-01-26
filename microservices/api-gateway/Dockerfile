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
# Build outputs to ../public
RUN npm run build

# ---------- SERVER ----------
WORKDIR /app

# Copy only server package files and install deps
COPY package*.json ./
RUN npm ci

# Copy the rest of the server source code
COPY . .

############################
# Stage 2: Production image
############################
FROM node:20-alpine

WORKDIR /app

# Copy server code + node_modules + built public/ from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "src/index.js"]
