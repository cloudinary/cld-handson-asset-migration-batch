# What it is
🚚 A script that can be used to migrate assets to Cloudinary from sources supported by [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference#upload_required_parameters) in scenarios when gradual migration with [Cloudinary auto-upload feature](https://cloudinary.com/documentation/fetch_remote_images#auto_upload_remote_files) cannot be leveraged.

It is assumed that the migration problem is addressed in stages:

- **Stage #1** 🛠️ Prepare input CSV file for the asset migration (with the tools of your choice)
- **Stage #2** 🚚 Run the migration for the assets detailed in CSV file (using this tool)
- **Stage #3** Iterate to identify assets that failed to migrate and re-attempt migration
  * 🛠️ Filter the output of the migration script (with the tools of your choice)
  * 🚚 Use the filtered output as input for the re-try migration batch (using this tool)

This script provides the following features:
- Customizable mapping of CSV records to Cloudinary API parameters
- Concurrent invocation of Cloudinary API
- Memory-efficient handling of large input CSV files
- Visual progress reporting during migration
- Detailed logging (JSONL) to track/troubleshoot each migration operation
- Migration report (CSV) produced from the migration log file

# What it is NOT
It is not a tool for any Cloudinary migration. It is intended to be a starter for IT/software engineers to migrate large volumes of assets in cases when bulk migration remains the only option.

# How to use it

1. [📋 Prepare the CSV data for the asset migration](./readme/data-for-the-migration.md)
1. [💻 Provision runtime for the script](./readme/provision-runtime.md)
1. [⚙️ Configure script for the migration](./readme/configure.md)
1. [🚚 Run the script and obtain migration report CSV file](./readme/run-migration-obtain-report.md)
1. [🔄 Iterate to identify and re-attempt assets that failed to migrate](./readme/identify-reattempt-failed.md)
