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

Once the information about the remote assets (asset URLs) and taxonomy (for example tags, metadata or any other input supported by Cloudinary Upload API) has been consolidated into a CSV file, you can leverage the toolset to:
- Quickly “map” the columns from the CSV file to the Cloudinary Upload API parameters
- Run the migration flow for all assets in the CSV file and obtain the migration report

You can then use any data manipulation software you are familiar with (Excel, pandas with Python, PowerShell, etc) with the migration report to
- Filter out the assets that failed to migrate
- Investigate typical causes for the migration issues
- Address the causes behind the failure and prepare a new input CSV file with only the assets that need to be re-attempted

This toolset can then further be leveraged to
- Run the migration flow for the assets to be re-attempted and obtain the migration report
