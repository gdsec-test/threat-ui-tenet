FROM 764525110978.dkr.ecr.us-west-2.amazonaws.com/alpine-node:14.15.4-alpine-3.12
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

COPY app /app

WORKDIR /app

USER root

RUN apk add --no-cache \
    git \
    openssl


RUN mkdir /.cache && chown nobody /.cache
RUN chown nobody /app
RUN chown -R nobody /app/.next
RUN chown -R nobody /app/build
RUN npm rebuild node-sass

# Generate self-signed cert thats used by the gasket service (check plugins/deploy-plugin.js)
RUN npm run createcert

CMD npx gasket build --env=${NODE_ENV}} && npx gasket start --env=${NODE_ENV}

EXPOSE 8443

USER nobody
