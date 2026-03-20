FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV LISTEN_HOST=0.0.0.0
ENV LISTEN_PORT=4321

EXPOSE 4321

CMD ["npm", "start"]
