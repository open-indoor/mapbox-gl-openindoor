#!/bin/bash

# Locally: wget http://localhost://maplibre-gl-openindoor.umd.min.js
# From front-app: wget http://maplibre-gl-openindoor/maplibre-gl-openindoor.umd.min.js
# wget https://app.openindoor.io/maplibre-gl-openindoor/dist/maplibre-gl-openindoor.umd.min.js

export CADDYPATH=/data/caddy

cd /etc/caddy/Caddyfile

caddy run --watch --config /etc/caddy/Caddyfile
