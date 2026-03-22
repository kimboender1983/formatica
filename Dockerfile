FROM node:20-alpine AS builder

# Enable corepack for yarn
RUN corepack enable

WORKDIR /app

# Copy workspace config
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/core/package.json packages/core/
COPY packages/formcraft/package.json packages/formcraft/
COPY packages/react/package.json packages/react/
COPY playground/package.json playground/

# Force node-modules linker in Docker (PnP needs the global cache which isn't available)
RUN echo "nodeLinker: node-modules" >> .yarnrc.yml

# Install dependencies
RUN yarn install

# Copy source
COPY . .

# Restore node-modules linker override for build
RUN echo "nodeLinker: node-modules" >> .yarnrc.yml

# Build all packages (core -> vue -> react) then playground
RUN yarn build && yarn build:playground

# Production: serve with a lightweight static server
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/playground/dist /usr/share/nginx/html

EXPOSE 8080
