/**
 * @fileoverview Intended to encapsulate details on reporting files.
 */

const path = require('node:path');

/**
 * Returns report file path within provided output folder.
 *
 * @param {string} outputFolder - The output folder path.
 * @returns {string} - The path to the 'report.csv' file within the output folder.
 */
function getReportFilePath(outputFolder) {
    return path.join(outputFolder, 'report.csv');
}

module.exports = {
    getReportFilePath
}