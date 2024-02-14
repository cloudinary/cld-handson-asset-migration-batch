# Overview

The migration script reads asset details from an input CSV file and generates two types of output files in a specified output folder: a log file (in JSONL format) and a migration report (in CSV format).

- **Log File**: Think of this as a comprehensive record for each asset migration.
- **Migration Report**: Produced from the Log File. Combines the initial input for each asset (from the input CSV file) with additional columns indicating the migration status.

To avoid accidental overwrites, the script will terminate if directed to an existing output folder. This design encourages you to use a unique folder for each migration round, preserving data from previous rounds. For example:

- `round1-initial` for the initial migration run
- `round2-recovery` for a second attempt focusing on assets that failed during the initial run
- ...and so on.

Also, you'll need to specify the number of concurrent Cloudinary Upload API invocations the script should make. To minimize the risk of receiving `420` status codes, we recommend setting this value to `10`.

# Running over SSH

For large-scale migrations, we advise running the script on a cloud-hosted VM. See the [Provision Runtime](./provision-runtime.md) section for guidance. If using this approach, ensure you're using a terminal multiplexer like `screen` or `tmux` to prevent the migration from terminating if the SSH connection drops.

# Invocation

Run the migration script as follows:

```bash
# If running over SSH, use a terminal multiplexer 
# This ensures the script is not terminated when SSH connection is terminated or times out
screen -S "cld_migration"

# Run the migration script with the following command
node ./cld-bulk.js migrate \
    --from-csv-file /path/to/input/file.csv \
    --output-folder /path/to/output/folder/for/this/migration/round \
    --max-concurrent-uploads 10
```

# Monitoring for errors

The migration script keeps updating the `log.json` file in the specified output folder.

Oftentime when errors do occur it is helpful to know what types of errors those are (network "hiccups" or incorrect upload API parameters).

If you would like to monitor for errors in the log file during the script execution you can adjust the following command:

```bash
#
# Make sure to replace <input-field-name> with a column name from the input CSV file 
# (for example, the one you use to pass `public_id` for the asset)
#

tail -f log.jsonl | jq -r 'select(.summary.status != "MIGRATED") | [.input.<input-field-name>, .summary.status, "--", .summary.err] | join("  ")'
```
