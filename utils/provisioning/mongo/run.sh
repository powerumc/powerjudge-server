#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker run \
--name powerjudge-mongo \
-p 27017:27017 \
-e MONGO_INITDB_DATABASE=pj \
-e MONGO_INITDB_ROOT_USERNAME=pjadmin \
-e MONGO_INITDB_ROOT_PASSWORD=pjadmin \
-v /pj/mongo/data/db:/data/db \
-v /pj/mongo/data/configdb:/data/configdb \
-it \
--rm \
powerjudge/powerjudge-mongo:${VERSION}
