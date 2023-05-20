/**
 * @fileoverview Parses arguments from the command line. 
 */

const fs = require('node:fs');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const {terminalWidth} = require('yargs');

// Define command line arguments using yargs
const cmdline_args = yargs(hideBin(process.argv))
  .option('from-csv-file', {
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
  .option('log-file', {
    description: 'Log file for the execution',
    type: 'string',
    demandOption: true // Required argument
  })
  .option('max-concurrent-uploads', {
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

module.exports = {
    fromCsvFile           : cmdline_args['from-csv-file'],
    maxConcurrentUploads  : cmdline_args['max-concurrent-uploads'],
    logFile               : cmdline_args['log-file']
}