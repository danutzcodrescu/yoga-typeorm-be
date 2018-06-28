FROM node:8

WORKDIR /dist

COPY package*.json ./
COPY dist ./
COPY ormconfig.json ./

RUN npm install

EXPOSE 4000

CMD [ "node", "index.js" ]
