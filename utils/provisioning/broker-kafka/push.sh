#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker tag powerjudge/powerjudge-broker-kafka:${VERSION} powerjudge/powerjudge-broker-kafka:latest
docker push powerjudge/powerjudge-broker-kafka
