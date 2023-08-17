const fs = require('fs');
const path = require('path');
const testResources = require('../../resources');
const mainLoop = require('../../../lib/main-loop');
const api2payload = require('../../../__input-to-api-payload');

const INPUT_CSV_FILE = path.join(__dirname, 'input.csv');
//
// Persisted to CSV file used as input for the end-to-end test
// Keys are used as asset public_ids
// Values are expanded into CSV columns 
//
const TEST_INPUT = {
    test_http_remote_asset_small: {Ref: 'https://res.cloudinary.com/cld-sol-demo/image/upload/sample.jpg'},
    test_local_asset_small:       {Ref: '../../.resources/sample.jpg'},
    test_local_asset_large:       {Ref: '../../.resources/waterfall-video-107mb.mp4'},
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
    const header = 'public_id,' + Object.keys(inputSource).join(',');
    // Use keys as values for the public_id column, and values as values for the remaining columns
    // Assume the same structure for all records
    const csv = Object.entries(inputSource).reduce((acc, [public_id, record]) => {
        const row = public_id + ',' + Object.values(record).join(',');
        return acc + '\n' + row;
    }, header); 
    return csv;
}

const spy = {
    api2payload: jest.spyOn(api2payload, 'input2ApiPayload'),
}


describe('End-to-end basic', () => {
    beforeAll(async () => {
        // Downloading large video asset
        await testResources.createLargeVideoTestAsset_Async();
        // Serializing test input to CSV file
        const inputCsvTxt = testInput2CsvText(TEST_INPUT);
        fs.writeFileSync(INPUT_CSV_FILE, inputCsvTxt);
    });

    afterAll(async () => {
        // Restoring any mocked functions
        jest.restoreAllMocks();
        // Removing large video asset
        await testResources.cleanupLargeVideoTestAsset_Async();
        // Removing test input CSV file
        fs.unlinkSync(INPUT_CSV_FILE);
    });

    it('test 1', () => {
        console.log('test 1');
    });

    it('test 2', () => {
        console.log('test 2');
    });
});

