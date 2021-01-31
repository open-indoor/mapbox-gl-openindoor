################### MAPBOX-GL-INDOOR BUILDER #######
FROM node:15-alpine as builder

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

ENV NPM_TOKEN
