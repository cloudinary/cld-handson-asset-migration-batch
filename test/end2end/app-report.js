const fs = require('fs');
const { parse } = require('csv-parse');

/**
 * Parses the provided CSV file (assuming it to be the migration report) and returns an object with methods to access 
 * the parsed records either by index or by public_id.
 *
 * @param {string} filePath - Path to the CSV file.
 * 
 * @return {Promise<object>} An object containing:
 *   - getPath: A function that returns the path to the CSV file.
 *   - getLength: A function that returns the total number of records.
 *   - getEntryByIndex: A function that takes an index and returns the record at that index.
 *   - getEntriesByPublicId: A function that takes a public_id and returns an array of records 
 *                            associated with that public_id.
 * 
 * Assumptions:
 *   - Records of interest have the `public_id` column
 *   - There can be multiple records associated with a single public_id
 *
 * @throws {Error} Will throw an error if a row in the CSV file cannot be parsed.
 */
async function parseCSVFile_Async(filePath) {
    const records = [];
    const pubId2RecordsIndex = {};

    // Parse the CSV file using csv-parse
    const parser = fs.createReadStream(filePath).pipe(parse({
        columns: true // Detect columns from the first line of the file
    }));

    for await (const row of parser) {
        try {
            // Add parsed record to records array, persist the index at which it was added
            const currentRecordIndex = records.push(row) - 1;

            // Check if the record has the required structure and add it to the recordsByPublicId object
            if (row.public_id) {
                const publicId = row.public_id;
                if (!pubId2RecordsIndex[publicId]) {
                    pubId2RecordsIndex[publicId] = [];
                }
                pubId2RecordsIndex[publicId].push(currentRecordIndex);
            }
        } catch (error) {
            throw new Error(`Failed to parse row: ${JSON.stringify(row)}`);
        }
    }

    return {
        getPath: () => filePath,
        getLength: () => records.length,
        getEntryByIndex: (index) => records[index],
        getEntriesByPublicId: (publicId) => { // There can be multiple records associated with a single public_id
            return pubId2RecordsIndex[publicId]
                ? pubId2RecordsIndex[publicId].map((index) => records[index])
                : [];
        }
    };
}

module.exports = {
    parseCSVFile_Async
};
