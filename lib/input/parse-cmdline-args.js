/**
 * @fileoverview Parses arguments from the command line. 
 */

const fs = require('node:fs');
const path = require('node:path');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const {terminalWidth} = require('yargs');

// Define command line arguments using yargs
const cmdline_args = yargs(hideBin(process.argv))
  .option('from-csv-file', {
    alias: 'f',
    description: 'CSV file detailing assets to import',
    type: 'string',
    demandOption: true, // Required argument
    coerce: path => {
      if (!fs.existsSync(path)) {
        throw new Error(`File does not exist: ${path}`);
      }
      return path;
    }
  })
  .option('output-folder', {
    alias: 'o',
    description: 'Folder name for the migration log and report files. To prevent data loss the script fails if either file already exists.',
    type: 'string',
    demandOption: true, // Required argument
    coerce: folder => {
      const logFilePath = getLogFilePath(folder);
      const logFileExists = fs.existsSync(logFilePath);

      const reportFilePath = getReportFilePath(folder);
      const reportFileExists = fs.existsSync(reportFilePath);

      if (logFileExists || reportFileExists) {
        const logFileCallout = logFileExists ? `❗️ Migration log file ${logFilePath} already exists.\n` : '';
        const reportFileCallout = reportFileExists ? `❗️ Migration report file ${reportFilePath} already exists.\n` : '';
        let message = `${logFileCallout}${reportFileCallout}\n`;
        message += "💡 To prevent unintentional data loss for large migration batches please specify a different output folder or move/rename the existing files.";
        throw new Error(message);
      }

      // Creating output folder if it does not exist yet
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }

      return folder;
    }
  })
  .option('max-concurrent-uploads', {
    alias: 'c',
    description: 'Max number of concurrent uploads',
    type: 'number',
    demandOption: true, // Required argument
    coerce: value => {
      const intValue = parseInt(value, 10);
      if (isNaN(intValue) || intValue < 1 || intValue > 20) {
        throw new Error(`Invalid value for max concurrent uploads: ${value}`);
      }
      return intValue;
    }
  })
  .wrap(terminalWidth())
  .argv;

function getLogFilePath(outputFolder) {
  return path.join(outputFolder, 'log.jsonl');
}

function getReportFilePath(outputFolder) {
  return path.join(outputFolder, 'report.csv');
}

module.exports = {
    fromCsvFile           : cmdline_args['from-csv-file'],
    maxConcurrentUploads  : cmdline_args['max-concurrent-uploads'],
    logFile               : getLogFilePath(cmdline_args['output-folder']),
    reportFile            : getReportFilePath(cmdline_args['output-folder'])
}