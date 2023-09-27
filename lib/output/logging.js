/**
 * @fileoverview This module sets up logging functionalities using bunyan for logging script execution.
 * It extends Error.prototype to ensure that all exception details are serialized when logged.
 */

const fs = require('node:fs');
const path = require('node:path');
const bunyan = require('bunyan');

/**
 * Configures log output file in the script output folder.
 * Creates loggers for script execution and payload (migration/update) operations.
 * Extends Error.prototype to make sure all exception details are serialized for logging.
 *
 * @param {string} outputFolderPath - The path to the output folder for logs.
 * @returns {Object} - An object containing script logger, payload logger, and log file path.
 */
function setupLogInFolder(outputFolderPath) {
    const logFilePath = getLogFilePath(outputFolderPath);
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
    const payloadLog = scriptLogger.child({ flow: 'payload' });

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
        payload: payloadLog,
        logFile: logFilePath
    }
};

/**
 * Returns script log file path in the provided output folder.
 *
 * @param {string} outputFolder - The path to the script output folder.
 * @returns {string} - Log file path in the output folder.
 */
function getLogFilePath(outputFolder) {
    return path.join(outputFolder, 'log.jsonl');
}

module.exports = { 
    setupLogInFolder,
    getLogFilePath
}