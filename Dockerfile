FROM node:12

RUN npm install --global typescript
RUN npm install --global ts-node

WORKDIR /app

ADD . /app

RUN npm install