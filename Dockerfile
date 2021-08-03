FROM node:14-alpine

RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm ci --production
COPY . .

CMD ["npm", "start"]