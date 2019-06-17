#!/usr/bin/env bash

VERSION=$(cat ../../../package.json | jq -r '.version')
echo "powerjudge version ${VERSION}"

docker build -f mono/5.18.1.0/Dockerfile -t powerjudge/powerjudge-compiler-mono:5.18.1.0 .
#docker tag powerjudge/powerjudge-compiler-mono:${VERSION} powerjudge/powerjudge-compiler-mono:latest

docker build -f gcc/8.3.0/Dockerfile -t powerjudge/powerjudge-compiler-gcc:8.3.0 .
#docker tag powerjudge/powerjudge-compiler-gcc:${VERSION} powerjudge/powerjudge-compiler-gcc:latest
