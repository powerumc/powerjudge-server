#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker tag powerjudge-mongo:${VERSION} powerjudge-mongo:latest
docker push powerjudge-mongo
