FROM node:8-alpine

WORKDIR /usr/app

COPY package.json .

RUN npm i

COPY . .

RUN npm install pm2 -g

CMD ["pm2-runtime", "./app.js"]
