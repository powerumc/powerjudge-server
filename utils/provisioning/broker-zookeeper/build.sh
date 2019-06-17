#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker build -f Dockerfile -t powerjudge/powerjudge-broker-zookeeper:${VERSION} .
