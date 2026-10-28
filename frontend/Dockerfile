# Multi-Stage Build: Stage 1 - Build Vite React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Multi-Stage Build: Stage 2 - High Performance Nginx Web Server
FROM nginx:alpine

# Clean default html
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled frontend from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with reverse proxy support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
