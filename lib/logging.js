/**
 * Introduces two log flows differentiated by the 'flow' property.
 * The module requires parameter (path to the log file) to be passed on module import.
 * 
 * 'script' flow is used for logging script execution (parameters, completion etc.)
 * 'migration' flow is used to log summary of each migration operation
 */

const fs = require('node:fs');
const bunyan = require('bunyan');

module.exports = function (logFilePath) {
    // Delete log file if it already exists
    // Done to avoid appending to existing log file (bunyan only appends)
    if (fs.existsSync(logFilePath)) { 
        fs.unlinkSync(logFilePath); 
    }

    // Creating main bunyan logger and setting up log file as the only stream
    const scriptLogger = bunyan.createLogger({
        name:'main',
        streams: [
            {
                path: logFilePath,
                level: 'info'
            }
        ]
    });

    // Adding child loggers to differentiate different information "flows"
    // and filter them out later on when needed
    const scriptLog = scriptLogger.child({ flow: 'script' });
    const migrationLog = scriptLogger.child({ flow: 'migration' });

    /**
     * Ensuring all exceptions details are serialized when logging
     * https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
     */
    if (!('toJSON' in Error.prototype))
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {};

            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true,
        writable: true
    });

    // Returning all the logger instances to the caller 
    return {
        script: scriptLog,
        migration: migrationLog,
        logFile: logFilePath
    }
};