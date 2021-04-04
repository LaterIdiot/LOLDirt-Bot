FROM node:14

WORKDIR /bot

COPY package*.json ./

RUN npm i

COPY . .

CMD [ "node", "." ]