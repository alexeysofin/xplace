#!/bin/bash
set -exu

if [ ! -z "${WAIT_FOR+x}" ]; then
IFS=',' read -ra arr <<< "$WAIT_FOR"

# wait until a port is binded by some server
# (db), because docker-compose's 
# depends_on does not guarantee that servers inside
# bind on ports
for i in "${arr[@]}"; do
    /wait-for-it.sh $i -t 15
done

fi


exec $@