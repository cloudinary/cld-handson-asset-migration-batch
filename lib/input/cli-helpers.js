const fs = require('node:fs');
const commander = require('commander');
const logging = require('../output/logging');
const reporting = require('../output/reporting');


const MIN_CONCURRENT_OPERATIONS = 1;
const MAX_CONCURRENT_OPERATIONS = 20;


function exitIfAlreadyExistsOrCreateNew(cliOptionValue) {
    const folder = cliOptionValue;

    const logFilePath = logging.getLogFilePath(folder);
    const logFileExists = fs.existsSync(logFilePath);

    const reportFilePath = reporting.getReportFilePath(folder);
    const reportFileExists = fs.existsSync(reportFilePath);

    if (logFileExists || reportFileExists) {
        const logFileCallout = logFileExists ? `❗️ Migration log file ${logFilePath} already exists.\n` : '';
        const reportFileCallout = reportFileExists ? `❗️ Migration report file ${reportFilePath} already exists.\n` : '';
        let message = `${logFileCallout}${reportFileCallout}\n`;
        message += "💡 To prevent unintentional data loss for large migration batches please specify a different output folder or move/rename the existing files.";
        throw new commander.InvalidOptionArgumentError(message);
    }

    // Creating output folder if it does not exist yet
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {recursive: true});
    }

    return folder;
}

function inputFileMustExist(cliOptionValue) {
    const path = cliOptionValue;
    if (!fs.existsSync(path)) {
        throw new commander.InvalidOptionArgumentError('File does not exist');
    }
    return path;
}

function ensureDoesNotExceedMax(cliOptionValue) {
    const intValue = parseInt(cliOptionValue, 10);
    if (isNaN(intValue)) {
      throw new commander.InvalidOptionArgumentError('Must be a number');
    }
    if (intValue < MIN_CONCURRENT_OPERATIONS) {
        throw new commander.InvalidOptionArgumentError(`Number of concurrent operations must be between ${MIN_CONCURRENT_OPERATIONS} and ${MAX_CONCURRENT_OPERATIONS}`);
    }
    if (intValue > 20) {
        throw new commander.InvalidOptionArgumentError(`Number of concurrent operations must not exceed ${MAX_CONCURRENT_OPERATIONS}`);
    }
    return intValue;
}

module.exports = {
    exitIfAlreadyExistsOrCreateNew,
    inputFileMustExist,
    ensureDoesNotExceedMax
}