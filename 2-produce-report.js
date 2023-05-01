/**
 * Yields migration report (CSV) from the migration log file.
 * Uses stream processing to avoid loading the entire log file into memory.
 */

const fs = require('node:fs');
const split2 = require('split2');
const {stringify} = require('csv-stringify');
const config = require('./config');

/**
 * Converts a log line (assumed to be JSONL) to a "flat" JS object.
 * The produced JS object is to be serialized to CSV text and added to report file.
 * 
 * Ignores all log lines that are not part of the 'migration' flow. *
 * 
 * Customize this function to suit your needs (e.g. add more fields to the report).
 *
 * Default implementation always includes the input record (from the CSV file) that
 * was used as input for migration operation. This allows to filter the report file
 * and re-use it as input for a subsequent "retry" migration operation for previously
 * failed assets.
 * 
 * @param {*} logLine 
 * @returns {Object} - JS object that represets a CSV row in the migration report
 */
function extractMigrationFlowRecord(logLine) {
    try {
        const logRec = JSON.parse(logLine);

        if (logRec.flow !== 'migration') { return undefined; }

        const inputRec = logRec.input;
        const status = logRec.summary.status;
        let migrationSummaryRec = {
            Cld_Status    : status,
            Cld_Operation : null,
            Cld_Error     : null,
            Cld_PublicId  : null,
            Cld_Etag      : null,
        };
        if (status !== 'MIGRATED') {
            migrationSummaryRec.Cld_Error = logRec.summary.err.message;
        } else {
            migrationSummaryRec.Cld_Operation = logRec.response.overwritten ? 'Overwritten' : 'Uploaded';
            migrationSummaryRec.Cld_PublicId = logRec.response.public_id;
            migrationSummaryRec.Cld_Etag = logRec.response.etag;
        }
        return {...inputRec, ...migrationSummaryRec};
    } catch (err) {
        console.error(err);
    }
}

const csvStringifier = stringify({
    header: true
});

fs.createReadStream(config.LOG_FILE)
  .pipe(split2(extractMigrationFlowRecord))
  .pipe(csvStringifier)
  .pipe(fs.createWriteStream(config.REPORT_FILE));

console.log(`🏁 Migration report persisted to the file: '${config.REPORT_FILE}'`);