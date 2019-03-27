#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker build -f mono/Dockerfile -t powerjudge/powerjudge-compiler-mono:${VERSION} .
docker build -f gcc/Dockerfile -t powerjudge/powerjudge-compiler-gcc:${VERSION} .
