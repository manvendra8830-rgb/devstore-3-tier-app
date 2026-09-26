# =========================================================
# Stage 1: Build React application
# =========================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first
# This improves Docker layer caching
COPY package*.json ./

RUN npm ci

# Copy application source
COPY . .

# Build production files
RUN npm run build


# =========================================================
# Stage 2: Serve React with Nginx
# =========================================================

FROM nginx:1.27-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy React production build
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
