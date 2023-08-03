const path = require('node:path');

function getReportFilePath(outputFolder) {
    return path.join(outputFolder, 'report.csv');
}

module.exports = {
    getReportFilePath
}