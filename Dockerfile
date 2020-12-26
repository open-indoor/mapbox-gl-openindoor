################### MAPBOX-GL-INDOOR BUILDER #######
FROM node:12-alpine as builder

RUN apk add --update-cache \
    git \
    jq \
    curl \
    bash \
    net-tools \
    grep \
    vim \
    gettext \
    util-linux \
    && rm -rf /var/cache/apk/*

WORkDIR /mapbox-gl-openindoor
COPY ./package.json             ./
COPY ./rollup.config.js         ./
COPY ./.babelrc                 ./
COPY ./yarn.lock                ./
COPY ./mapbox-gl-openindoor.css ./
RUN npm install --loglevel verbose

COPY ./src/                     ./src/
RUN yarn build

################### MAPBOX-GL-INDOOR BUILDER #######
FROM caddy:2-alpine

RUN apk add --update-cache \
    curl \
    wget \
    procps \
    bash \
    net-tools \
    grep \
    vim \
    gettext \
    util-linux \
    && rm -rf /var/cache/apk/*

RUN mkdir -p /data/www/dist/
COPY --from=builder /mapbox-gl-openindoor/dist/ /data/www/dist/
COPY --from=builder /mapbox-gl-openindoor/mapbox-gl-openindoor.css /data/www/dist/

COPY ./Caddyfile /etc/caddy/Caddyfile
COPY ./mapbox-gl-openindoor.sh /usr/bin/mapbox-gl-openindoor.sh
RUN chmod +x /usr/bin/mapbox-gl-openindoor.sh

ENV APP_DOMAIN_NAME app.openindoor.io
CMD /usr/bin/mapbox-gl-openindoor.sh
EXPOSE 80
