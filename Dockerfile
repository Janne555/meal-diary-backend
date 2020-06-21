FROM node:12

RUN npm install --global typescript

WORKDIR /app

ADD . /app

CMD "npm" "run" "start:prod"