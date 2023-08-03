const fs = require('node:fs');
const path = require('node:path');
const commander = require('commander');


function getLogFilePath(outputFolder) {
    return path.join(outputFolder, 'log.jsonl');
}

function getReportFilePath(outputFolder) {
    return path.join(outputFolder, 'report.csv');
}

function exitIfAlreadyExistsOrCreateNew(cliOptionValue) {
    const folder = cliOptionValue;

    const logFilePath = getLogFilePath(folder);
    const logFileExists = fs.existsSync(logFilePath);

    const reportFilePath = getReportFilePath(folder);
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
    if (intValue < 1) {
        throw new commander.InvalidOptionArgumentError('Number of concurrent operations must be between 1 and 20');
    }
    if (intValue > 20) {
        throw new commander.InvalidOptionArgumentError('Number of concurrent operations must not exceed 20');
    }
    return intValue;
}

module.exports = {
    exitIfAlreadyExistsOrCreateNew,
    inputFileMustExist,
    ensureDoesNotExceedMax,
    getLogFilePath,
}