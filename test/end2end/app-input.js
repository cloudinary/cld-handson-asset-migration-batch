const fs = require('fs');
const csvSync = require('csv-stringify/sync');

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
function _testInput2CsvText(inputSource) {
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

/**
 * Converts an input source object into a CSV file.
 * 
 * @param {*} config
 * @param {Object} config.test_input - Object representing the input source (see _testInput2CsvText for details)
 * @param {string} config.csv_file_path - The path to the CSV file to be created.
 */
function testInput2CsvFile(config) {
    // Ensure config has 'test_input' and 'csv_file_path' properties (raise otherwise)
    const { test_input, csv_file_path } = config;

    // Ensure 'test_input' is non-empty (raise otherwise)
    if (!Object.keys(test_input).length) {
        throw new Error('test_input is empty');
    }

    // Ensure 'csv_file_path' is non-empty (raise otherwise)
    if (!csv_file_path) {
        throw new Error('csv_file_path is empty');
    }

    const csvTxt = _testInput2CsvText(test_input);
    fs.writeFileSync(csv_file_path, csvTxt);
}


module.exports = {
    testInput2CsvFile
};
