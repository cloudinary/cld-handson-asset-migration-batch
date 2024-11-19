#!/bin/bash

# File to be monitored
LOGFILE=$1

# Processing payload entries from the log to produce tally
grep -F '"flow":"payload"' $LOGFILE | \
awk '
    BEGIN {
        # Explicitly initialize variables to 0
        created = 0
        overwritten = 0
        existing = 0
        failure = 0
    }    
    {
        migrated = index($0, "\"status\":\"MIGRATED\"")
        if (migrated) {
            if (index($0, "\"existing\":true")) {
                existing++
            } else if (index($0, "\"overwritten\":true")) {
                overwritten++
            } else {
                created++
            }
        } else {
            failure++
        }
    }    
    END {
        print "🟢 Created            : ", created
        print "🟡 Overwritten        : ", overwritten
        print "⚪️ Existing (skipped) : ", existing
        print "🔴 Failed             : ", failure
    }
'