FROM node:lts-alpine3.17
WORKDIR /app

COPY package.json package-lock.json ./
COPY ./prisma ./prisma

RUN npm ci

RUN npx prisma generate

COPY . .
RUN npm run build

CMD ["sh", "-c", "exec node dist/app.js"]