FROM node:alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm install semver
RUN npm install date-fns --save

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
