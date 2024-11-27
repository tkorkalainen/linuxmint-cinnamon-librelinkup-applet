#!/bin/bash
URL="$1"
USERNAME="$2"
PASSWORD="$3"
echo -n $(curl -s -H 'accept-encoding:gzip' -H 'cache-control:no-cache' -H 'connection:keep-alive' -H 'content-type:application/json' -H 'product:llu.android' -H 'version:4.7' -X POST -d '{"email":"'"$USERNAME"'","password":"'"$PASSWORD"'"}' $URL --compressed | jq -r .data.authTicket.token)
