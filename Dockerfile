FROM node:19-alpine
WORKDIR /node
COPY package.json .
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && yarn install \
    && apk del .gyp
COPY . .
RUN yarn run build
EXPOSE 8080
USER node
CMD ["yarn", "start"]


