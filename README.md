# What it is
🚚 A script that can be used to migrate assets available via HTTP(S) protocol to Cloudinary via Cloudinary Upload API in scenarios when gradual migration with [Cloudinary auto-upload feature](https://cloudinary.com/documentation/fetch_remote_images#auto_upload_remote_files) cannot be leveraged.

It is assumed that the migration problem is addressed in stages:

- **Stage #1** 🛠️ Prepare input CSV file for the asset migration (with the tools of your choice)
- **Stage #2** 🚚 Run the migration for the assets detailed in CSV file (using this tool)
- **Stage #3** Iterate to identify assets that failed to migrate and re-attempt migration
  * 🛠️ Filter the output of the migration script (with the tools of your choice)
  * 🚚 Use the filtered output as input for the re-try migration batch (using this tool)

This script provides the following features:
- Concurrent invocation of Cloudinary Upload API
- Memory-efficient handling of large input CSV files
- Detailed logging (JSONL) to track/troubleshoot each migration operation
- Migration report (CSV) produced from the migration log file

# What is is NOT

It is not a tool for any Cloudinary migration. This script focuses on the most common use case when assets accessible via HTTP(S) need to be migrated to Cloudinary in bulk when gradual migration with [Cloudinary auto-upload feature](https://cloudinary.com/documentation/fetch_remote_images#auto_upload_remote_files) cannot be leveraged.

# How to use it

1. [📋 Prepare the CSV data for the asset migration](./readme/s01-data-for-the-migration.md)
1. [💻 Provision runtime for the script](./readme/s02-provision-runtime.md)
1. [⚙️ Configure script for the migration](./readme/s02.1-configure.md)
1. [🚚 Run the script and obtain migration report CSV file](./readme/s03-run-migration-obtain-report.md)
1. [🔄 Iterate to identify and re-attempt assets that failed to migrate](./readme/s04-identify-reattempt-failed.md)
