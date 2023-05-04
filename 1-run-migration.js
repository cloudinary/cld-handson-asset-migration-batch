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
    scriptLog.info(migrationOptions, 'Starting migration routine');
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
