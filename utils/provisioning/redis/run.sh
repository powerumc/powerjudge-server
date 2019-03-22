#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker run \
--name powerjudge-redis \
-p 6379:6379 \
-it \
--rm \
powerjudge/powerjudge-redis:${VERSION}
