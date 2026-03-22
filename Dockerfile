FROM node:20-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/core/package.json packages/core/
COPY packages/vue/package.json packages/vue/
COPY packages/react/package.json packages/react/
COPY playground/package.json playground/

RUN echo "nodeLinker: node-modules" >> .yarnrc.yml
RUN yarn install

COPY . .

RUN echo "nodeLinker: node-modules" >> .yarnrc.yml
RUN yarn build && yarn build:playground

# Production
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/playground/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
