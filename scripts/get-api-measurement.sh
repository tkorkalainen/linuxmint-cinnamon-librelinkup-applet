#!/bin/bash
URL="$1"
TOKEN="$2"
echo -n $(curl -s -H 'authorization:Bearer '$TOKEN'' -H 'accept-encoding:gzip' -H 'cache-control:no-cache' -H 'connection:keep-alive' -H 'content-type:application/json' -H 'product:llu.android' -H 'version:4.7' -X GET $URL --compressed | jq -r '.data[0].glucoseMeasurement | "\(.Value);\(.GlucoseUnits);\(.TrendArrow);\(.Timestamp)"')
