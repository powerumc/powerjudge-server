#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker tag powerjudge-redis:${VERSION} powerjudge-redis:latest
docker push powerjudge-redis
