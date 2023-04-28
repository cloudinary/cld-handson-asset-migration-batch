/**
 * Yields migration report (CSV) from the log file
 */

const fs = require('node:fs');
const split2 = require('split2');
const {stringify} = require('csv-stringify');
const config = require('./config');

/**
 * Converts a log line (assumed to be JSONL) to a "flat" JS object
 * that represets a CSV row in the migration report
 * 
 * @param {*} logLine 
 * @returns 
 */
function log2Report(logLine) {
    try {
        const logRec = JSON.parse(logLine);

        if (logRec.flow !== 'migration') { return undefined; }

        const inputRec = logRec.input;
        const status = logRec.summary.status;
        let migrationSummaryRec = {
            Mig_Status      : status,
            Mig_Operation   : null,
            Mig_Error       : null,
            Mig_CldPublicId : null,
            Mig_CldEtag     : null,
        };
        if (status !== 'MIGRATED') {
            migrationSummaryRec.Mig_Error = logRec.summary.err.message;
        } else {
            migrationSummaryRec.Mig_Operation = logRec.response.overwritten ? 'Overwritten' : 'Uploaded';
            migrationSummaryRec.Mig_CldPublicId = logRec.response.public_id;
            migrationSummaryRec.Mig_CldEtag = logRec.response.etag;
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
  .pipe(split2(log2Report))
  .pipe(csvStringifier)
  .pipe(fs.createWriteStream(config.REPORT_FILE));