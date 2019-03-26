#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker run \
--name powerjudge-broker-kafka \
-p 9092:9092 \
-e KAFKA_BROKER_ID="1" \
-e KAFKA_ZOOKEEPER_CONNECT="zookeeper:2181" \
-e KAFKA_ADVERTISED_HOST_NAME="localhost" \
-e KAFKA_ADVERTISED_PORT="9092" \
-e KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://localhost:9092" \
-e KAFKA_LOG_DIRS="/pj/kafka/log" \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /pj/kafka/data:/pj/kafka/data \
--link powerjudge-broker-zookeeper:zookeeper \
-it \
--rm \
powerjudge/powerjudge-broker-kafka:${VERSION}
