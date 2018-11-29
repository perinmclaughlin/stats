#!/usr/bin/bash
set -e
CONTAINER=ariovistus/chrome-node
WORKDIR="-v $(pwd):/usr/src/app:z -u $(id -u):$(id -g)"
sed -i s/{git-commit}/`git rev-parse HEAD`/ aurelia_project/environments/prod.ts
docker run $WORKDIR --rm --entrypoint rm $CONTAINER -rf dist/*
docker run $WORKDIR --rm --entrypoint yarn $CONTAINER install
docker run $WORKDIR --rm --entrypoint ./node_modules/.bin/au $CONTAINER build --env prod
mkdir -p dist
cp index.html dist
cp -r scripts dist
cp -r static dist
cp sw.js dist
