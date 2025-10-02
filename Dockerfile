FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 2222

CMD ["node", "server.js"]
