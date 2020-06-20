FROM node:12

RUN npm install --global typescript

WORKDIR /app

ADD . /app

RUN npm install

CMD "npm" "run" "start:prod"