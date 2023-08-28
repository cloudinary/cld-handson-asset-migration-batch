# Overview

Each migration process is unique, both in terms of the systems involved and the taxonomy requirements. Because of this, there isn't a "one-size-fits-all" solution. The best approach to prepare for migration is to use the tools you're already familiar with to consolidate the asset data you wish to migrate into a single CSV file.

# Purpose

The CSV file you create will serve as the input for the migration script. Before you can start the migration, you'll need to customize a [dedicated script module](../__input-to-api-payload.js) to map column values from the CSV file to Cloudinary's Upload API parameters. For more details on how to do this, please refer to the [script configuration section](./configure.md).

# Recommendations

## Think Through the Taxonomy 🤔

- Consider preparing a document that maps the taxonomy from your current workflow to the one in Cloudinary. 
    - This document will not only help clarify the migration process but can also serve as future documentation for your team.

## Migrate High-Quality Assets 🔗

- When building CSV input file and referencing assets via URLs or file paths:
    - Make sure to reference the assets in the largest available dimensions (to allow for highest quality transformations).
    - Make sure the referenced assets have had the least aggressive compression algorithms applied prior to being migrated (to avoid visual artifacts).

## Use External IDs for Structured Metadata 🛠️

- Translate [Cloudinary's structured metadata values for single- and multi-select fields](https://cloudinary.com/documentation/dam_admin_structured_metadata#external_id) to external IDs.
    - This translation can be done either in the tool you use to generate the CSV file or by adding custom logic to the [__input-to-api-payload.js](../__input-to-api-payload.js) module.
