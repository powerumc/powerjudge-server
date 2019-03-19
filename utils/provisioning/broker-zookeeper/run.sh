#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker run \
--name powerjudge-broker-zookeeper \
-p 2181:2181 \
-p 2888:2888 \
-p 3888:3888 \
-v ${PWD}/conf:/opt/zookeeper/conf \
-it \
--rm \
powerjudge/powerjudge-broker-zookeeper:${VERSION}
