#!/usr/bin/bash
set -e
CONTAINER=ariovistus/chrome-node
WORKDIR="-v $(pwd):/usr/src/app:z -u $(id -u):$(id -g)"

docker run $WORKDIR --rm --entrypoint ./node_modules/.bin/au $CONTAINER test --browser ChromiumHeadless1
#docker run $WORKDIR --rm -it --entrypoint sh $CONTAINER 

