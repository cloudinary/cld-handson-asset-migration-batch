require('dotenv').config(); // Load environment variables from .env file
const async = require('async');
const progress = require('./progress');
const logging = require('./output/logging');
const csvReader = require('./input/csv-file-reader');
const cloudinary = require('cloudinary').v2;

/* ℹ️ 👇 Modules intended to be customized */
// Logic to convert each CSV record into parameters for the Cloudinary Upload API
const {input2ApiPayload} = require('../__input-to-api-payload');
// Logic to convert migration log file into migration report
const {log2Report} = require('../__log-to-report');


//
// Module logging variables (set up when main loop starts and processes input params)
//
let scriptLog = null;
let payloadLog = null;

//
// Migration flow implementation
//
async function loopOverCsvInput_Async (payloadModule, cliParams, confirmationRoutinesModule) {
    // Retrieving required command line parameters passed for the invocation
    const inputCsvFilePath = cliParams.fromCsvFile;
    const maxConcurrentUploads = cliParams.maxConcurrentUploads;
    const outputFolder = cliParams.outputFolder;


    // Set up logging for the loop
    const log = logging.setupLogIn(outputFolder);
    scriptLog = log.script;
    payloadLog = log.payload;


    await ensureCloudinaryConfigOrExit_Async();

    const operationOptions = {
        dest_cloud             : cloudinary.config().cloud_name,
        parameters             : cliParams,
    }

    try {
        await confirmationRoutinesModule.confirmOperationOptionsOrExit_Async(operationOptions);
    } catch (err) {
        const msg = 'Migration parameters not confirmed. Terminating';
        console.error(`🛑 ${msg}`);
        scriptLog.fatal(operationOptions, msg);
        // Allowing bunyan to "catch up" on writing the log file: https://github.com/trentm/node-bunyan/issues/37
        await new Promise(resolve => setTimeout(resolve, 500));
        process.exit(1);
    }

    scriptLog.info(operationOptions, 'Migration parameters confirmed. Starting migration routine');
    const stats = {
        concurrent: 0,
        attempted: 0,
        succeeded: 0,
        failed: 0
    }

    console.log('\n\n🚚 Starting migration routine');

    // Initializing visual progress bar
    await progress.init_Async(inputCsvFilePath);

    // Using async generator to avoid loading the entire input file into memory
    const inputRecordGeneratorAsync = csvReader.getRecordGenerator_Async(inputCsvFilePath);

    // Using async.mapLimit to limit the number of concurrent operations
    await async.mapLimit(inputRecordGeneratorAsync, maxConcurrentUploads, async (input) => {
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
            response = await payloadModule.payloadFunc_Async(payload);
            stats.succeeded += 1;
        } catch (err) {
            stats.failed += 1;
            summary.status = 'FAILED';
            summary.err = err;
        } finally {
            payloadLog.info({input, payload, response, summary});
            progress.update(stats.concurrent, stats.attempted, stats.succeeded, stats.failed);
            stats.concurrent -= 1;
        }
    });
    scriptLog.info({stats}, 'Routine complete');
    progress.stop();
    
    console.log(`🏁 Bulk routine complete. Summary: ${JSON.stringify(stats)}}`);
    console.log(`🪵  Log persisted to the file: '${log.logFile}'.`);

    await produceMigrationReport_Async(outputFolder);
}

/**
 * Ensures Cloudinary config is set.
 * Reports error and exits process otherwise. 
 */
async function ensureCloudinaryConfigOrExit_Async() {
    if (!cloudinary.config().cloud_name) {
        const message = 'Cloudinary config is not initialized. Please set CLOUDINARY_URL environment variable (explicitly or via .env file).'
        console.error(`🛑 ${message}`);
        scriptLog.info(message);
        // Allowing bunyan to "catch up" on writing the log file: https://github.com/trentm/node-bunyan/issues/37
        await new Promise(resolve => setTimeout(resolve, 500));
        process.exit(1);
    }
}


/**
 * Produces migration report from the migration log file.
 */
async function produceMigrationReport_Async(outputFolder) {
    console.log(`\n\n📋 Producing migration report from the migration log file`);
    console.log('⏳ This may take some time for large migration batches.');
    // Allowing bunyan to "catch up" on writing the log file: https://github.com/trentm/node-bunyan/issues/37
    await new Promise(resolve => setTimeout(resolve, 1500));
    log2Report(outputFolder);
    console.log(`🏁 Migration report produced.`);
}

module.exports = {
    loopOverCsvInput_Async
}