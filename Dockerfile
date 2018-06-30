FROM node:8-alpine
LABEL author=DANUT

ENV NODE_ENV=production

COPY ./dist ./src
COPY ormconfig.json .
COPY package.json .
COPY ./certs ./certs

RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
  && npm install \
  && apk del .build-deps

EXPOSE 4000

CMD [ "npm", "run", "start-prod" ]
