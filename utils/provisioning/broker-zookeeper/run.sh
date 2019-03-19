#!/usr/bin/env bash

docker run \
--name powerjudge-broker-zookeeper \
-p 2181:2181 \
-p 2888:2888 \
-p 3888:3888 \
-v ${PWD}/conf:/opt/zookeeper/conf \
-it \
--rm \
powerjudge/powerjudge-broker-zookeeper:0.0.1
