FROM 764525110978.dkr.ecr.us-west-2.amazonaws.com/alpine-node:12-alpine-3.12

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG GD_ROOT_DOMAIN
ENV GD_ROOT_DOMAIN=$GD_ROOT_DOMAIN

USER root
RUN apk add openssl
COPY --chown=nobody app /app

WORKDIR /app

# RUN npm ci --no-audit
RUN npm i

# Generate self-signed cert thats used by the gasket service (check plugins/deploy-plugin.js)
RUN npm run createcert

# RUN mkdir /.cache && chown nobody /.cache

RUN npm rebuild node-sass

# Build application
RUN npx gasket build --env=${NODE_ENV}

CMD npx gasket start --env=${NODE_ENV}

EXPOSE 8443


