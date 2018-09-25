FROM node:8-alpine
LABEL author=DANUT

ENV NODE_ENV=production

COPY ./dist ./src
COPY ormconfig.json .
COPY package.json .
COPY ./certs ./certs
COPY ./node_modules ./node_modules

EXPOSE 4000

CMD [ "npm", "run", "start-prod" ]
