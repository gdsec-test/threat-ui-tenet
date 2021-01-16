FROM 764525110978.dkr.ecr.us-west-2.amazonaws.com/alpine-node:14.15.4-alpine-3.12

COPY app /app

WORKDIR /app

USER root

RUN mkdir /.cache && chown nobody /.cache
RUN chown nobody /app
RUN chown -R nobody /app/.next
RUN chown -R nobody /app/build
RUN npm rebuild node-sass

CMD npx gasket build --env=development && npx gasket start --env=development

EXPOSE 80

USER nobody
