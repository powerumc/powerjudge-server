#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker tag powerjudge/powerjudge-broker-zookeeper:${VERSION} powerjudge/powerjudge-broker-zookeeper:latest
docker push powerjudge/powerjudge-broker-zookeeper
