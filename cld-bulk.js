#!/usr/bin/env node
/**
 * @fileoverview This is the main entry point for the CLI tool.
 * 
 * 💡 Edit the `__input-to-api-payload.js` module to customize how CSV input is "translated" to Cloudinary API payload
 * 
 * Recieves migration parameters from the command line (see `lib/parse-cmdline-args.js` for details)
 * Requires CLOUDINARY_URL environment variable to be set (either explicitly or via a .env file)
 * 
 * Runs migration flow:
 *  - Confirms migration parameters with the user (requires explicit confirmation to proceed)
 *  - Reads the input from the CSV file (uses Nodejs stream API to avoid loading the entire file into memory)
 *  - Runs concurrent migration operations (up to the maxConcurrentUploads parameter)
 *      + Converts each input CSV record to Cloudinary API payload (uses the logic you define in the `__input-to-api-payload.js` module)
 *      + Invokes Cloudinary Upload API with the payload
 *
 * Produces log file with two types of records: `script` (flow="script") and `payload` (flow="payload").
 * The `payload` records contain:
 *  - input (row from CSV file)
 *  - payload (parameters for Cloudinary API produced from the input)
 *  - response (Cloudinary API response)
 *  - summary (migration operation status and error message if it failed)
 * 
 * `payload` records from the log file are then used to produce the operation report.
 */
const cli = require('./lib/input/cli');

// Parsing the user input and invoking cli action
const __program = cli.yieldProgramInstance();
__program.parse(process.argv);