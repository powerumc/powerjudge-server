#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
IP=$(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p')

echo "powerjudge version ${VERSION}"
echo "ip: ${IP}"

docker run \
--name powerjudge-broker-kafka \
-p 9092:9092 \
-e KAFKA_BROKER_ID="1" \
-e KAFKA_ZOOKEEPER_CONNECT="zookeeper:2181" \
-e KAFKA_LISTENERS="PLAINTEXT://:9092" \
-e KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://${IP}:9092" \
-e KAFKA_LOG_DIRS="/pj/kafka/log" \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /pj/kafka/data:/pj/kafka/data \
--link powerjudge-broker-zookeeper:zookeeper \
-it \
--rm \
powerjudge/powerjudge-broker-kafka:${VERSION}
