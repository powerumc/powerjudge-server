#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker build -f mono/Dockerfile -t powerjudge/powerjudge-compiler-mono:${VERSION} .
docker tag powerjudge/powerjudge-compiler-mono:${VERSION} powerjudge/powerjudge-compiler-mono:latest

docker build -f gcc/Dockerfile -t powerjudge/powerjudge-compiler-gcc:${VERSION} .
docker tag powerjudge/powerjudge-compiler-gcc:${VERSION} powerjudge/powerjudge-compiler-gcc:latest
