/**
 * @fileoverview This module encapsulates the logic to create a memory-efficient CSV record generator for a CSV file.
 * It uses the Node stream API to read and parse the CSV file one record at a time, allowing processing of large files
 * without loading the entire file into memory.
 */

const fs = require('node:fs');
const {parse} = require('csv-parse');

/**
 * Asynchronously generates CSV records from a given CSV file. 
 * This function utilizes Node.js streams to handle potentially large CSV files in a memory-efficient way.
 * Records are read and parsed "on demand" when the generator's next value is requested.
 *
 * @async
 * @generator
 * @function getRecordGenerator_Async
 * @param {string} csvFilePath - Path to the CSV file to read.
 * @yields {Object} A single record from the CSV file, parsed into a JavaScript object where property names correspond to CSV column headers.
 */
async function* getRecordGenerator_Async(csvFilePath) {
    const parser = fs.createReadStream(csvFilePath)
        .pipe(parse({columns: true}));

    for await (const record of parser) {
        yield record;
    }
}

module.exports = {
    getRecordGenerator_Async
};

