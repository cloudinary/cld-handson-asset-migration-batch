const testAppLog = require('./app-log');
const testAppReport = require('./app-report');
const testResources = require('../resources');
const logging = require('../../lib/output/logging');
const reporting = require('../../lib/output/reporting');
const cliHelpers = require('../../lib/input/cli-helpers');

const mainLoop = require('../../lib/main-loop'); // <== This is the module we are testing


/**
 * Invoke the main loop for testing purposes.
 * 
 * This function is designed to call the loopOverCsvInput_Async function with custom parameters 
 * tailored for testing scenarios. Depending on the test context, some functions or modules 
 * might need to be mocked or spied upon.
 * 
 * @param {Object} [customCliArgs] - Custom command line arguments for testing.
 * @param {Object} [customCliCommand] - Custom command object derived from command line arguments.
 * @param {Object} [customPayloadModule] - Custom payload module for testing.
 * @param {Object} [customConfirmationRoutinesModule] - Custom confirmation routines module for testing.
 * 
 * @returns {Promise} A promise that resolves when the loopOverCsvInput_Async function completes.
 */
async function invokeMainLoopForTest_Async(
    testCliArgs, 
    testCliCommand, 
    testPayloadModule, 
    testConfirmationRoutinesModule
) {
    if (!testCliArgs) {
        throw new Error('testCliArgs must be provided');
    }

    if (!testCliCommand) {
        throw new Error('testCliCommand must be provided');
    }

    if (!testPayloadModule) {
        throw new Error('testPayloadModule must be provided');
    }

    // Providing default routine for confirmation
    const defaultConfirmationRoutinesModule = {
        confirmOperationOptionsOrExit_Async: async () => { return Promise.resolve(true); }
    };

    // Merging default values with custom values provided as arguments.
    const cliArgs = testCliArgs;
    const cliCommand = testCliCommand;
    const payloadModule = testPayloadModule;
    const confirmationRoutinesModule = testConfirmationRoutinesModule || defaultConfirmationRoutinesModule;

    const TEST_OUTPUT_FOLDER = cliArgs.outputFolder;
    // This function would be invoked as part of argument parsing by commander.
    // Invoking it explicitly here to ensure that the test output folder exists.
    cliHelpers.exitIfAlreadyExistsOrCreateNew(TEST_OUTPUT_FOLDER);

    console.log('Running the app main loop (this may take some time)...');
    // Suppressing console output from the main loop
    const originalLogFn = console.log;
    console.log = jest.fn();

    // Now, invoke the main loop with the assembled parameters.
    await mainLoop.loopOverCsvInput_Async(
        cliArgs, 
        cliCommand, 
        payloadModule, 
        confirmationRoutinesModule);

    // Restoring console output
    console.log = originalLogFn;

    console.log('Parsing the migration log file...');
    const testLogFilePath = logging.getLogFilePath(TEST_OUTPUT_FOLDER);
    const testLog = await testAppLog.parseLogFile_Async(testLogFilePath);

    console.log('Parsing the migration report file...');
    const testReportFilePath = reporting.getReportFilePath(TEST_OUTPUT_FOLDER);
    const testReport = await testAppReport.parseCSVFile_Async(testReportFilePath);

    return {
        testLog,
        testReport,
    }
}

/**
 * Cleans up the test environment.
 * 
 * This function is designed to remove any test artifacts that might have been created during
 * the test run. Depending on the test context, some functions or modules might need to be
 * mocked or spied upon.
 * 
 * @param {Object} [config] - Configuration object for the cleanup.
 * @param {string} [config.input_csv_file] - Path to the input CSV file to be removed.
 * @param {string} [config.test_output_folder] - Path to the test output folder to be removed.
 * 
 * @returns {Promise} A promise that resolves when the cleanup completes.
 */
async function testCleanup_Async(config) {
    const { input_csv_file, test_output_folder } = config || {};
    // Raise error if input_csv_file is not provided
    if (!input_csv_file) {
        throw new Error('input_csv_file must be provided');
    }
    // Raise error if test_output_folder is not provided
    if (!test_output_folder) {
        throw new Error('test_output_folder must be provided');
    }

    // Removing test input CSV file if it exists
    await testResources.deleteFile_Async(input_csv_file);
    // Recursively removing test output folder if it exists
    testResources.deleteFolderIfNoSubfolders(test_output_folder);
}


module.exports = {
    invokeMainLoopForTest_Async,
    testCleanup_Async,
}
