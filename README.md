# What it is
A toolset that can be used to migrate assets available via HTTP(S) protocol to Cloudinary via Cloudinary Upload API in cases when [Cloudinary auto-upload feature](https://cloudinary.com/documentation/fetch_remote_images#auto_upload_remote_files) cannot be leveraged.

This toolset assumes that the migration problem is addressed two-stage:
- **Step #1**
  * Information about the remote assets (asset URL) and taxonomy (for example tags, metadata etc.) is consolidated into a CSV file
- **Step #2**
  * The CSV file is then used as input to migrate each asset to Cloudinary with detailed log and migration report

This toolset provides a customizable solution to implement **Step #2**.

**Step #1** will need to be implemented separately (as most migrations have unique requirements).

This toolset provides the following features:
- Concurrent invocation of Cloudinary Upload API
- Memory-efficient handling of large input CSV files
- Detailed logging (JSONL) to track/troubleshoot each migration operation
- Migration report (CSV) produced from the migration log file


# What is is NOT

It is not a tool for any Cloudinary migration. This toolset focuses on the most common use case when assets accessible via HTTP(S) need to be migrated to Cloudinary in bulk in cases when [Cloudinary auto-upload feature](https://cloudinary.com/documentation/fetch_remote_images#auto_upload_remote_files) cannot be leveraged.

# How to use it

1. [📋 Prepare the CSV data for the migration](./readme/s01-data-for-the-migration.md)
1. [💻 Provision runtime for the toolset and configure it](./readme/s02-runtime-and-config.md)
1. [🚚 Run the migration and obtain migration report CSV file](./readme/s03-run-migration-obtain-report.md)
1. [🔄 Iterate to identify and re-attempt assets that failed to migrate](./readme/s04-identify-reattempt-failed.md)
