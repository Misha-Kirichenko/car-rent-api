FROM node:18.7.0 as node-main
WORKDIR /app
COPY . .
COPY package*.json ./
RUN npm ci
CMD ["npm", "run", "start:dev"]