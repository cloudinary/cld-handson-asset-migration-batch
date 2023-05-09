/**
 * Runs migration flow:
 *  - Reads the input from CSV file (uses Nodejs stream API to avoid loading the entire file into memory)
 *  - Runs concurrent migration operations (up to MAX_CONCURRENT_UPLOADS)
 *      + Converts each input CSV record to Cloudinary API payload
 *      + Invokes Cloudinary Upload API with the payload
 *
 * Produces log file which is then used to produce migration report.
 * 
 * To simplify the implementation:
 *  - all the parameters are passed via the 'config' module
 *  - progress is logged to the log file
 */

require('dotenv').config(); // Load environment variables from .env file
const async = require('async');
const config = require('./config');
const progress = require('./lib/progress');
const csvReader = require('./lib/csv-file-reader');
const {confirm_Async} = require('./lib/confirm-migration-params');
const {input2ApiPayload} = require('./__input-to-api-payload');
const cloudinary = require('cloudinary').v2;

const log = require('./lib/logging')(config.LOG_FILE);
const scriptLog = log.script;
const migrationLog = log.migration;

(async () => {
    const migrationOptions = {
        dest_cloud    : cloudinary.config().cloud_name,
        from_csv_file : config.INPUT_FILE,
    }
    
    tryEnsureCloudinaryConfig();

    await confirmMigrationOptionsOrExit_Async(migrationOptions);

    scriptLog.info(migrationOptions, 'Migration parameters confirmed. Starting migration routine');
    const stats = {
        concurrent: 0,
        attempted: 0,
        succeeded: 0,
        failed: 0
    }
    
    // Initializing visual progress bar
    await progress.init_Async(config.INPUT_FILE);

    // Using async generator to avoid loading the entire input file into memory
    const inputRecordGeneratorAsync = csvReader.getRecordGenerator_Async(config.INPUT_FILE);

    // Using async.mapLimit to limit the number of concurrent operations
    await async.mapLimit(inputRecordGeneratorAsync, config.MAX_CONCURRENT_UPLOADS, async (input) => {
        let payload = null;
        let response = null;
        let summary = {
            status: 'MIGRATED',
            err: null
        }
        try {
            stats.concurrent += 1;
            stats.attempted += 1;
            payload = input2ApiPayload(input);
            response = await cloudinary.uploader.upload(payload.file, payload.options);
            stats.succeeded += 1;
        } catch (err) {
            stats.failed += 1;
            summary.status = 'FAILED';
            summary.err = err;
        } finally {
            migrationLog.info({input, payload, response, summary});
            progress.update(stats.concurrent, stats.attempted, stats.succeeded, stats.failed);
            stats.concurrent -= 1;
        }
    });
    scriptLog.info({stats}, 'Migration routine complete');
    progress.stop();
    
    console.log(`🏁 Migration routine complete. Summary: ${JSON.stringify(stats)}}`);
    console.log(`🪵  Log persisted to the file: '${config.LOG_FILE}'.`);
})();

/**
 * Ensures Cloudinary config is set.
 * Raises exception otherwise. 
 */
function tryEnsureCloudinaryConfig() {
    if (!cloudinary.config().cloud_name) {
        throw new Error('Cloudinary config is not initialized. Please set CLOUDINARY_URL environment variable.');
    }
}

/**
 * Prompts user to confirm migration parameters (source file and destination cloud).
 * If confirmed - returns. Otherwise - exits the script.
 * 
 * @param {Object} migrationOptions 
 * @param {string} migrationOptions.dest_cloud    -  Destination Cloudinary environment (sub-account)
 * @param {string} migrationOptions.from_csv_file -  Path to the CSV file with the migration input
 */
async function confirmMigrationOptionsOrExit_Async(migrationOptions) {
    const migrationPrompt = 
    `❗️WARNING: This script will perform asset migration with the following parameters:
         - source file      :  '${migrationOptions.from_csv_file}'
         - destination cloud:  '${migrationOptions.dest_cloud}' 
    Are you sure you want to proceed?`;
    const promptConfirmed = await confirm_Async(migrationPrompt);
    if (!promptConfirmed) {
        console.log('🛑 Migration parameters not confirmed. Terminating');
        scriptLog.info(migrationOptions, 'Migration parameters not confirmed. Terminating');
        process.exit(1); // Exiting the script main function
    }
}