# admin/Dockerfile
FROM node:20-alpine AS base

# working directory inside container
WORKDIR /app 

# Install dependencies
FROM base AS dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Developement stage (used in docker-compose)
FROM base AS development

# Copy /app/node_modules from dependencies stage into ./node_modules (/app/node_modules for development)
COPY --from=dependencies /app/node_modules ./node_modules

COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev", "--", "-p", "3001"]
