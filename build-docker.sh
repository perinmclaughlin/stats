#!/usr/bin/bash
set -e
sed -i s/{git-commit}/`git rev-parse HEAD`/ aurelia_project/environments/prod.ts
docker run -v $(pwd):/app --entrypoint rm sandrokeil/typescript -rf dist/*
docker run -v $(pwd):/app --entrypoint yarn sandrokeil/typescript install
docker run -v $(pwd):/app --entrypoint ./node_modules/.bin/au sandrokeil/typescript build --env prod
mkdir -p dist
cp index.html dist
cp -r scripts dist
cp -r static dist
cp sw.js dist
