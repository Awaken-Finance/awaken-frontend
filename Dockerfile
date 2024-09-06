FROM node:18.16.0-alpine as base
WORKDIR /app
RUN apk update && apk add git
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --registry=https://registry.yarnpkg.com/
ARG BUILD_ENV
COPY  . ./
RUN yarn build:${BUILD_ENV}
FROM nginx:latest
COPY --from=base /app/build /usr/share/nginx/html
COPY ./nginxConf/nginx.conf /etc/nginx/
COPY ./nginxConf/default.conf /etc/nginx/conf.d/