FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
RUN mkdir -p src/logs
EXPOSE 3001
CMD ["node", "src/index.js"]
