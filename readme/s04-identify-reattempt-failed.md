# Overview

Oftentimes you may run into situations where some of the assets failed to migrate (will be reported by the tool).

To aid you in identifying and addressing those the tool produces migration report CSV file on execution.

The migration report file will include all the columns from the initial input file with a few additional columns to allow you filter out records for the assets that failed to migrate. 

And because the report file contains all the same columns as the initial migration input - this filtered migration report can be used as input for a subsequent "recovery" run of the migration script.

# Migration report structure

The migration script adds the following additional columns to the migration report (in addition to the columns from the input CSV file):

- `Cld_Status` : set to `MIGRATED` for successfully migrated assets
- `Cld_Operation` : identifies if the asset was created or overwritten 
    + `Overwritten` - if the Cloudinary asset already existed and was overwritten
        * This may indicate undesired behavior, for example if several assets in the migration input file were assigned the same `public_id`
    + `Uploaded` - if a new Cloudinary asset was created 
- `Cld_Error` : the error details for troubleshooting (if asset failed to migrate) 
- `Cld_PublicId`: `public_id` reported back by Cloudinary after uploading an asset
    + Should be used as "source of truth" when addressing migrated assets via Cloudinary API (as [Cloudinary may have to replace some of the characters](https://support.cloudinary.com/hc/en-us/articles/115001317409--Legal-naming-conventions))
- `Cld_Etag`
    + MD5 digest of the binary content of the uploaded asset
    + Can be used to identify identical assets (sharing the same MD5 digest)

# Identifying assets that failed to migrate

Using toolset of your choice (for example Excel, PowerShell, Python etc.) filter out CSV records that have `Cld_Status` column value different from `MIGRATED`.

Review the information in the `Cld_Error` column.

This is the creative part of the process. Typically you'll spot certain patterns in the messages that will hint you as to what went wrong and what needs to be adjusted before re-attempting migration for these assets. 

# Known error messages

Errors that identify failure to retrieve asset due to network issues:

- `Error in loading <asset_url> - Timed out reading data from server`
- `Error in loading <asset_url> - Server broke connection`
- `Error in loading <asset_url> - partial download`

and similar may occur due to network "hiccups" between the system of origin and Cloudinary back-end systems at the time of the migration. 

These would typically be resolved by simply re-attempting migration.

# Reattempting migration for failed assets

[Run the migration](./s03-run-migration-obtain-report.md) using the "filtered" CSV file you've produced.

It is up to you how you want to organize these re-attempts (by filtering out one problem at a time for each "recovery" run or attempting to address all problems in the same "recovery" run).

A "recovery" run can be identified by the folder passed as value for the `--output-folder` parameter of the migration script.

For example:

- `initial-migration` folder
    + for the first run
- `recovery/fixing-public-ids/first-attempt` folder 
    + for the "recovery" batch that fixes issues with `public_id` values
- `recovery/fixing-public-ids/second-attempt` folder 
    + for the "recovery" batch that fixes issues with `public_id` values that may have been omitted on the first run
- `recovery/reattemtping-network-issues/first-attempt` folder
    + for the "recovery" batch that re-attempts assets failing to migrate due to network issues

The better you organize these according to the logic of your migration flow - the easier it will be to consolidate all the reports in the final migration report file using the toolset of your choice.


