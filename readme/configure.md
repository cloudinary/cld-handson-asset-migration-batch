# Overview

Each migration is unique in terms of taxonomy (tags, metadata, destination folders etc.) for the migrated assets.

To accommodate for that the script comes with a customizable module that allows you to define with a few lines of JS code how the values from the input CSV file should be passed to Cloudinary API payload. 

Additionally, you will need to supply Cloudinary API credentials to allow the script to perform operations against the target Cloudinary sub-account (environment). 

The method detailed below (using `.env` file) prevents Cloudinary credentials from being accidentally checked into version control system.

# How to Configure the Script for Migration

## Map CSV Data to Cloudinary API Payload 🗺️

1. Open the [`__input-to-api-payload`](../__input-to-api-payload.js) module.
2. Follow the instructions to map the columns in your CSV input file to the parameters required by the Cloudinary API.

## Supply Cloudinary API Credentials *️⃣

1. Create a `.env` file in the root folder of the script (where the `package.json` file is located).
2. Locate the API Environment variable from the target Cloudinary sub-account.
    - You can find this by logging into the target sub-account and [navigating to the Programmable Media Dashboard](https://cloudinary.com/documentation/solution_overview#cloudinary_console).
3. Copy the entire API Environment variable, including the `CLOUDINARY_URL=` part, and paste it into the `.env` file.
