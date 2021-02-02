FROM 764525110978.dkr.ecr.us-west-2.amazonaws.com/alpine-node:14.15.4-alpine-3.12

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
RUN openssl genrsa -des3 -out /app/server.origKey -passout pass:server 1024
RUN openssl req -new -key /app/server.origKey  -out /app/server.csr  -subj "/C=US/ST=Arizona/L=Scottsdale/O=Go Daddy/OU=Product Security/CN=ui.threat.int.gdcorp.tools/emailAddress=oleg@godaddy.com"  -passin pass:server
RUN openssl rsa -in /app/server.origKey  -out /app/server.key -passin pass:server
RUN openssl x509 -req -days 3650  -in /app/server.csr  -signkey /app/server.key  -out /app/server.crt
RUN rm /app/server.origKey

CMD npx gasket build --env=production && npx gasket start --env=production

EXPOSE 8443

USER nobody
