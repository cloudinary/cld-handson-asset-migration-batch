# Overview

Each migration is unique in terms of systems involved and taxonomy requirements. 

There cannot be a "one size fits all" solution and the best way to prepare the migration input is to use tool(s) you are familiar with to combine the asset data you want to migrate into a single CSV file.

# Purpose

The CSV file you prepare will be used as input for the migration script.

Prior to starting the migration you will need to customize a [dedicated script module](../__input-to-api-payload.js) to "map" column values from the CSV file to the Cloudinary Upload API parameters. See the [script configuration](./s02.1-configure.md) section for details.

# Recommendations

- 🤔 Think through the taxonomy
    * Prepare document that "maps" taxonomy from your current workflow to the taxonomy in Cloudinary
        + Such document helps build clarity for the migration and can later be used as documentation for the team using migrated assets in Cloudinary
- 🔗 Migrate assets of the highest possible quality
    * When including asset URLs - make sure that
        + They serve assets in the largest available dimensions
        + They serve assets with least "agressive" compression algorithms applied
    * This will ensure that optimized versions for the migrated assets (produced by Cloudinary for delivery later on) are of highest possible quality
- 🛠️ "Translate" [Cloudinary structured metadata values for single- and multi-select fields](https://cloudinary.com/documentation/dam_admin_structured_metadata#external_id) to external ids
    * You may choose to perform such "translation" in the tool you use to produce the CSV file
    * Alternatively, you can perform such "translation" by adding custom logic to the [__input-to-api-payload.js](../__input-to-api-payload.js) module