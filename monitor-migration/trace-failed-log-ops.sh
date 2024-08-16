#!/bin/bash

# Log file to be scanned
LOGFILE=$1

# Processing payload entries with status different from MIGRATED
grep -F '"flow":"payload"' $LOGFILE | grep -F -v '"status":"MIGRATED"' | \
jq -r '(.summary.err | tostring)'
