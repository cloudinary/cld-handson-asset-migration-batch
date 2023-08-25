# Overview

Each migration is unique in terms of taxonomy (tags, metadata, destination folders etc.) for the migrated assets.

To accommodate for that the script comes with a customizable module that allows you to define with a few lines of JS code how the values from the input CSV file should be passed to Cloudinary Upload API. 

Also, you'll need to supply the script with the Cloudinary API credentials to allow the script to create assets in the target Cloudinary sub-account (environment). The method detailed below (using `.env` file) prevents Cloudinary credentials from being accidentally checked into version control system.

# Configuring the script for a migration

1. 🗺️ "Map" the input CSV data to Cloudinary Upload API payload
    - Follow instructions in the [__input-to-api-payload](../__input-to-api-payload.js) module 
1. *️⃣ Supply the script with the Cloudinary API credentials for the target sub-account
    - This can be done by following the steps below:
        + Create `.env` file in the script root folder (the one containing the `package.json` file)
        + Copy and paste the API Environment variable from the target sub-account (including the `CLOUDINARY_URL=` portion) into the file
            + The API environment variable can be located by logging into the target sub-account and [navigating to the Programmable Media Dashboard](https://cloudinary.com/documentation/solution_overview#cloudinary_console)