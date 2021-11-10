FROM 764525110978.dkr.ecr.us-west-2.amazonaws.com/alpine-node:14.17.0-alpine-3.12

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG GD_ROOT_DOMAIN
ENV GD_ROOT_DOMAIN=$GD_ROOT_DOMAIN

USER root
COPY app /app


WORKDIR /app

RUN npm i
RUN npm prune

RUN apk add openssl

# Generate self-signed cert thats used by the gasket service (check plugins/deploy-plugin.js)

RUN npm run createcert

RUN mkdir /.cache && chown nobody /.cache
RUN chown -R nobody .
#RUN chown nobody /app
#RUN chown -R nobody /app/.next
#RUN chown -R nobody /app/build
RUN npm rebuild node-sass

RUN echo ${NODE_ENV}
# Build application
RUN npx gasket build --env=${NODE_ENV}

CMD npx gasket start --env=${NODE_ENV}

EXPOSE 8443

USER nobody
