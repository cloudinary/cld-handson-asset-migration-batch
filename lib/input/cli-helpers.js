/**
 * @fileoverview This module includes utility functions to validate CLI options.
 */

const fs = require('node:fs');
const commander = require('commander');
const logging = require('../output/logging');
const reporting = require('../output/reporting');


const MIN_CONCURRENT_OPERATIONS = 1;
const MAX_CONCURRENT_OPERATIONS = 20;


/**
 * Checks if a log or report file already exists in the provided output folder (to prevent unintentional data loss).
 *
 * @param {string} cliOptionValue - The output folder path passed via CLI argument.
 * @returns {string} - The same output folder path.
 * @throws {commander.InvalidOptionArgumentError} - If log or report file already exist.
 */
function exitIfAlreadyExistsOrCreateNew(cliOptionValue) {
    const folder = cliOptionValue;

    const logFilePath = logging.getLogFilePath(folder);
    const logFileExists = fs.existsSync(logFilePath);

    const reportFilePath = reporting.getReportFilePath(folder);
    const reportFileExists = fs.existsSync(reportFilePath);

    if (logFileExists || reportFileExists) {
        const logFileCallout = logFileExists ? `❗️ Migration log file ${logFilePath} already exists.\n` : '';
        const reportFileCallout = reportFileExists ? `❗️ Migration report file ${reportFilePath} already exists.\n` : '';
        let message = `\n\n${logFileCallout}${reportFileCallout}`;
        message += "💡 To prevent unintentional data loss for large migration batches please specify a different output folder or move/rename the existing files.";
        throw new commander.InvalidOptionArgumentError(message);
    }

    // Creating output folder if it does not exist yet
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {recursive: true});
    }

    return folder;
}


/**
 * Ensures the provided file path points to an existing file.
 *
 * @param {string} cliOptionValue - The input file path provided via CLI argument.
 * @returns {string} - The same file path.
 * @throws {commander.InvalidOptionArgumentError} - If the input file does not exist.
 */
function inputFileMustExist(cliOptionValue) {
    const path = cliOptionValue;
    if (!fs.existsSync(path)) {
        throw new commander.InvalidOptionArgumentError('File does not exist');
    }
    return path;
}


/**
 * Ensures the provided number of concurrent operations doesn't exceed the maximum.
 *
 * @param {string} cliOptionValue - The number of concurrent operations provided via CLI argument.
 * @returns {number} - The number of concurrent operations as an integer.
 * @throws {commander.InvalidOptionArgumentError} - If the provided value isn't a valid number or exceeds the allowed range.
 */
function ensureDoesNotExceedMax(cliOptionValue) {
    const intValue = parseInt(cliOptionValue, 10);
    if (isNaN(intValue)) {
      throw new commander.InvalidOptionArgumentError('Must be a number');
    }
    if (intValue < MIN_CONCURRENT_OPERATIONS) {
        throw new commander.InvalidOptionArgumentError(`Number of concurrent operations must be between ${MIN_CONCURRENT_OPERATIONS} and ${MAX_CONCURRENT_OPERATIONS}`);
    }
    if (intValue > MAX_CONCURRENT_OPERATIONS) {
        throw new commander.InvalidOptionArgumentError(`Number of concurrent operations must not exceed ${MAX_CONCURRENT_OPERATIONS}`);
    }
    return intValue;
}

module.exports = {
    exitIfAlreadyExistsOrCreateNew,
    inputFileMustExist,
    ensureDoesNotExceedMax
}