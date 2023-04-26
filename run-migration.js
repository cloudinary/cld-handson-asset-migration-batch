require('dotenv').config(); // Load environment variables from .env file
const async = require('async');
const config = require('./config');
const csvReader = require('./lib/csv-file-reader');
const apiPayload = require('./cld-api-payload');
const cloudinary = require('cloudinary').v2;

const log = require('./lib/logging')(config.LOG_FILE);
const scriptLog = log.script;
const migrationLog = log.migration;
const progressLog = log.progress;

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
    await async.mapLimit(csvReader.getRecordGenerator_Async(config.INPUT_FILE), config.MAX_CONCURRENT_UPLOADS, async (input) => {
        let payload = null;
        let response = null;
        let summary = {
            status: 'MIGRATED',
            err: null
        }
        try {
            stats.concurrent += 1;
            stats.attempted += 1;
            payload = apiPayload.fromCsvRecord(input);
            response = await cloudinary.uploader.upload(payload.file, payload.options);
            stats.succeeded += 1;
        } catch (err) {
            stats.failed += 1;
            summary.status = 'FAILED';
            summary.err = err;
        } finally {
            migrationLog.info({input, payload, response, summary});
            progressLog.info(`OK:${stats.succeeded} / ERR:${stats.failed} (out of ${stats.attempted} attempted). Currently running ${stats.concurrent} concurrent operations`);
            stats.concurrent -= 1;
        }
    });
    scriptLog.info({stats}, 'Migration routine complete');
})();
