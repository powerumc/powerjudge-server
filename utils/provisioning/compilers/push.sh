#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker tag powerjudge-compiler-cs:${VERSION} powerjudge-compiler-cs:latest
docker push powerjudge-compiler-cs
