const fs = require('fs');
const path = require('path');
const testAppLog = require('../app-log');
const csvSync = require('csv-stringify/sync');
const testResources = require('../../resources');
const logging = require('../../../lib/output/logging');
const testAppFlow = require('../test-invoke-app-flow');
const cliHelpers = require('../../../lib/input/cli-helpers');
const migrationPayload = require('../../../lib/payload/migrate');

const INPUT_CSV_FILE = path.join(__dirname, 'input.csv');
const TEST_OUTPUT_FOLDER = path.join(__dirname, 'test-output');
//
// Persisted to CSV file used as input for the end-to-end test
// Keys are used as asset public_ids
// Values are expanded into CSV columns 
//
const TEST_INPUT = {
    test_http_remote_asset_small: {Ref: 'https://res.cloudinary.com/cld-sol-demo/image/upload/sample.jpg'},
    test_local_asset_small:       {Ref: '../../.resources/sample.jpg'},
    test_local_asset_large:       {Ref: '../../.resources/waterfall-video-107mb.mp4'},
    test_asset_does_not_exist:    {Ref: 'https://res.cloudinary.com/cld-sol-demo/image/upload/this-asset-does-not-exist.png'},
}

/**
 * Converts an input source object into a CSV formatted string.
 * 
 * The function constructs the CSV with 'public_id' as the first column. The keys of the input source object are used as the values 
 * for the 'public_id' column, while the values of the input source object are used for the subsequent columns.
 * 
 * For example, given the input:
 * 
 * {
 *   key1: {Ref: 'value1'},
 *   key2: {Ref: 'value2'}
 * }
 * 
 * The output will be:
 * 
 * public_id,Ref
 * key1,value1
 * key2,value2
 * 
 * @param {Object} inputSource - An object where keys represent asset public_ids and values are objects with properties to be expanded into CSV columns.
 * @returns {string} A CSV formatted string representing the input source.
 */
function testInput2CsvText(inputSource) {
    // Check if the inputSource is non-empty
    if (!Object.keys(inputSource).length) {
        return '';
    }

    const firstRecord = Object.values(inputSource)[0];
    const header = ['public_id', ...Object.keys(firstRecord)];

    const records = Object.entries(inputSource).map(([public_id, record]) => {
        return { public_id, ...record };
    });

    // Convert records to CSV using csv-stringify
    const csv = csvSync.stringify(records, {
        header: true,
        columns: header
    });

    return csv;
}

// Mocking the CSV input to API payload conversion logic to match the 
// produced CSV input for the test
jest.mock('../../../__input-to-api-payload', () => {
    return {
        input2ApiPayload: jest.fn((csvRec) => {
            return {
                file: csvRec.Ref,
                options: {
                    public_id: csvRec.public_id,
                    unique_filename: false,
                    resource_type: 'auto',
                    type: 'upload',        
                }
            };
        })
    };
});

async function testCleanup_Async() {
    // Removing large video asset
    await testResources.cleanupLargeVideoTestAsset_Async();
    // Removing test input CSV file if it exists
    await testResources.deleteFile_Async(INPUT_CSV_FILE);
    // Recursively removing test output folder if it exists
    testResources.deleteFolderIfNoSubfolders(TEST_OUTPUT_FOLDER);
}

let testLog = null;

describe('End-to-end migration basic', () => {
    beforeAll(async () => {
        console.log('Preparing test environment');
        // Ensuring there are no artifacts from prior test run that could interfere
        await testCleanup_Async(); 
        
        console.log('Downloading large video asset...');
        await testResources.createLargeVideoTestAsset_Async();

        console.log('Serializing test input to CSV file...');
        const inputCsvTxt = testInput2CsvText(TEST_INPUT);
        fs.writeFileSync(INPUT_CSV_FILE, inputCsvTxt);

        console.log('Running the app main loop (this may take some time)...');
        // Ensuring the output folder exists and is empty
        cliHelpers.exitIfAlreadyExistsOrCreateNew(TEST_OUTPUT_FOLDER);
        // Suppressing console output from the main loop
        const originalLogFn = console.log;
        console.log = jest.fn();

        // Invoking the main loop for E2E testing
        await testAppFlow.invokeMainLoopForTest_Async(
            { // Mocking CLI args
                fromCsvFile: INPUT_CSV_FILE,
                maxConcurrentUploads: 2,
                outputFolder: TEST_OUTPUT_FOLDER,
            },
            { // Mocking CLI command
                name: () => 'migrate',
            },
            migrationPayload
        );
        
        // Restoring console output
        console.log = originalLogFn;

        console.log('Parsing the migration log file...');
        const testLogFilePath = logging.getLogFilePath(TEST_OUTPUT_FOLDER);
        testLog = await testAppLog.parseLogFile_Async(testLogFilePath);

        console.log('Done preparing test environment');
    }, 5*60*1000); // Explicitly setting timeout to allow for execution of the migration loop

    afterAll(async () => {
        await testCleanup_Async();
    });

    it('Should produce log file', async () => {
        const testLogFilePath = logging.getLogFilePath(TEST_OUTPUT_FOLDER); 
        expect(fs.existsSync(testLogFilePath)).toBe(true);
    });

});

