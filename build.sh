#!/bin/bash

cd /mapbox-gl-openindoor
# npm install --loglevel verbose
yarn install --frozen-lockfile 
yarn build
yarn publish