FROM node:10.9.0-alpine

ARG NODE_ENV=production

RUN apk add --no-cache git

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i --production

COPY src ./src

RUN if [ "$NODE_ENV" = "development" ] ; then npm i -g nodemon && npm i --only=dev ; fi

CMD [ "npm", "start" ]