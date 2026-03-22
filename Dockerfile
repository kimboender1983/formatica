FROM node:20-alpine AS builder

# Enable corepack for yarn
RUN corepack enable

WORKDIR /app

# Copy workspace config
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY packages/core/package.json packages/core/
COPY packages/formcraft/package.json packages/formcraft/
COPY packages/react/package.json packages/react/
COPY playground/package.json playground/

# Install dependencies
RUN yarn install --immutable

# Copy source
COPY . .

# Build all packages (core -> vue -> react) then playground
RUN yarn build && yarn build:playground

# Production: serve with a lightweight static server
FROM nginx:alpine

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built playground
COPY --from=builder /app/playground/dist /usr/share/nginx/html

EXPOSE 8080
