const mainLoop = require('../../lib/main-loop');  // Replace with the correct path to your main loop module.

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

module.exports = {
    invokeMainLoopForTest_Async
}
