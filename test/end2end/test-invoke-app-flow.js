const testResources = require('../resources');
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

    // Now, invoke the main loop with the assembled parameters.
    return mainLoop.loopOverCsvInput_Async(
        cliArgs, 
        cliCommand, 
        payloadModule, 
        confirmationRoutinesModule);
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
