################### MAPLIBRE-GL-INDOOR BUILDER #######
FROM node:15-alpine

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

ARG NPM_TOKEN

ENTRYPOINT /bin/bash -c
