const fs = require('fs');
const path = require('path');
const testAppInput = require('../app-input');
const testResources = require('../../resources');
const testAppFlow = require('../test-invoke-app-flow');
const migrationPayload = require('../../../lib/payload/migrate');

const INPUT_CSV_FILE = path.join(__dirname, 'input.csv');
const TEST_OUTPUT_FOLDER = path.join(__dirname, 'test-output');
//
// Persisted to CSV file used as input for the end-to-end test
// Keys are used as asset public_ids
// Values are expanded into CSV columns 
//
// Split into positive / negative to allow referencing separately in the tests
//
const _TEST_CASE_BULK_SIZE = 100; // Number of records to generate for each test case

const _TEST_CASES_POSITIVE_REMOTE = new Object();
for (let i = 0; i < _TEST_CASE_BULK_SIZE; i++) {
    _TEST_CASES_POSITIVE_REMOTE[`test_http_remote_asset_small_${i}`] = {Ref: 'https://res.cloudinary.com/cld-sol-demo/image/upload/sample.jpg'};
}

const _TEST_CASES_POSITIVE_LOCAL = new Object();
for (let i = 0; i < _TEST_CASE_BULK_SIZE; i++) {
    _TEST_CASES_POSITIVE_LOCAL[`test_local_asset_small_relpath_${i}`] = {Ref: testResources.getAssetPathRelativeToAppRoot('sample.jpg')};
}

const _TEST_CASES_NEGATIVE_REMOTE = new Object();
for (let i = 0; i < _TEST_CASE_BULK_SIZE; i++) {
    _TEST_CASES_NEGATIVE_REMOTE[`remote_test_asset_does_not_exist_${i}`] = {Ref: 'https://res.cloudinary.com/cld-sol-demo/image/upload/this-asset-does-not-exist.png'};
}

const _TEST_CASES_NEGATIVE_LOCAL = new Object();
for (let i = 0; i < _TEST_CASE_BULK_SIZE; i++) {
    _TEST_CASES_NEGATIVE_LOCAL[`local_test_asset_does_not_exist_${i}`] = {Ref: testResources.getAssetFullPath('this-asset-does-not-exist.jpg')};
}

const TEST_INPUT = {
    ..._TEST_CASES_POSITIVE_REMOTE,
    ..._TEST_CASES_POSITIVE_LOCAL,
    ..._TEST_CASES_NEGATIVE_REMOTE,
    ..._TEST_CASES_NEGATIVE_LOCAL,
};


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


async function cleanup() {
    await testAppFlow.testCleanup_Async({
        input_csv_file: INPUT_CSV_FILE,
        test_output_folder: TEST_OUTPUT_FOLDER,
    });
}

// Variables to reference records from the parsed migration log and report files
let __TEST_LOG = null;
let __TEST_REPORT = null;

describe('End-to-end migration bulk', () => {
    beforeAll(async () => {
        console.log('Preparing test environment');
        // Ensuring there are no artifacts from prior test run that could interfere
        await cleanup();
        
        console.log('Serializing test input to CSV file...');
        testAppInput.testInput2CsvFile({
            test_input: TEST_INPUT,
            csv_file_path: INPUT_CSV_FILE,
        });

        // Invoking the main loop for E2E testing
        const { testLog, testReport } = await testAppFlow.invokeMainLoopForTest_Async(
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
        
        __TEST_LOG = testLog;
        __TEST_REPORT = testReport;

        console.log('Done preparing test environment');
    }, 5*60*1000); // Explicitly setting timeout to allow for execution of the migration loop

    afterAll(async () => {
        await cleanup();
    });

    it('Should produce log file', async () => {
        expect(fs.existsSync(__TEST_LOG.getPath())).toBe(true);
    });

    test.each(
        Object.keys(TEST_INPUT)
    )('Should produce single log record for asset %s', (public_id) => {
        const testLogEntries = __TEST_LOG.getEntriesByPublicId(public_id);
        expect(testLogEntries.length).toEqual(1);
    });

    it('Should produce report file with a record for each input', () => {
        expect(fs.existsSync(__TEST_REPORT.getPath())).toBe(true);
        expect(__TEST_REPORT.getLength()).toEqual(Object.keys(TEST_INPUT).length);
    });

    test.each(
       Object.keys(_TEST_INPUT_POSITIVE)
    )('Should successfully migrate valid asset %s', (public_id) => {
        const testLogEntries = __TEST_LOG.getEntriesByPublicId(public_id);
        const testLogEntry = testLogEntries[0];
        expect(testLogEntry).not.toBeNull();
        expect(testLogEntry.summary.status).toEqual('MIGRATED');
    });

    test.each(
        Object.keys(_TEST_INPUT_POSITIVE)
    )('Should produce report record for migrated asset %s', (public_id) => {
        const testReportEntries = __TEST_REPORT.getEntriesByPublicId(public_id);
        expect(testReportEntries.length).toEqual(1);
        const testReportEntry = testReportEntries[0];
        expect(testReportEntry.Cld_PublicId).toEqual(public_id);
        expect(testReportEntry.Cld_Status).toEqual('MIGRATED');
    });

    test.each(
        Object.keys(_TEST_INPUT_NEGATIVE)
    )('Should report errors for invalid asset %s', (public_id) => {
        const testLogEntries = __TEST_LOG.getEntriesByPublicId(public_id);
        const testLogEntry = testLogEntries[0];
        expect(testLogEntry).not.toBeNull();
        expect(testLogEntry.summary.status).toEqual('FAILED');
    });

    test.each(
        Object.keys(_TEST_INPUT_NEGATIVE)
    )('Should produce report record for failed asset %s', (public_id) => {
        const testReportEntries = __TEST_REPORT.getEntriesByPublicId(public_id);
        expect(testReportEntries.length).toEqual(1);
        const testReportEntry = testReportEntries[0];
        expect(testReportEntry.public_id).toEqual(public_id);
        expect(testReportEntry.Cld_Status).toEqual('FAILED');
    });

});

