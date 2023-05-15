node ./1-run-migration.js \
    --from-csv-file ./assets-to-migrate-via-urls.csv \
    --log-file ./migration.log.jsonl \
    --max-concurrent-uploads 3