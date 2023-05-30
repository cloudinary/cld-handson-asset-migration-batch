# Overview 

The migration script reads the input CSV file and writes the output files (log file and migration report) to the output folder.

You can think of the log file (JSONL) as the "full story" for each asset migration. The log file is used to produce the migration report.

The migration report file (CSV) contains the initial input for the asset (from the input CSV file) as well as few additional columns to represent the migration status for each asset.

To make sure the log and report files are not unintentionally overridden - the script will exit if instructed to use output folder that already exists. The thinking behind it is - you will use a separate folder for each new "round". For example:

- `round1-initial` folder 
    + For the first time you run the script
- `round2-recovery` folder
    + When you re-attempt the migration for those assets that failed to migrate the first time
- and so on...

That ensures you will always have the data from previous migration rounds available.

Also, you need to instruct the script how many concurrent invocations of Cloudinary Upload API is permitted. To avoid running into `420` responses from Cloudinary back-end we recommend to have it set to `10`.

# Invocation

Invoke the migration script as follows:

```bash
node ./migrate-remote-assets.js \
    --from-csv-file /path/to/input/file.csv \
    --output-folder /path/to/output/folder/for/this/migration/round \
    --max-concurrent-uploads 10
```
