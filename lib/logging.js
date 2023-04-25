/**
 * Introduces two log flows differentiated by the 'flow' property.
 * The module requires parameter (path to the log file) to be passed on module import.
 * 
 * 'script' flow is used for logging script execution.
 * 'migration' flow is used to log summary of each migration operation. 
 */

const bunyan = require('bunyan');

module.exports = function (logFilePath) {
    var module = {};

    const scriptLogger = bunyan.createLogger({
        name:'main',
        streams: [
            {
                path: logFilePath,
                level: 'info'
            }
        ]
    });

    const scriptLog = scriptLogger.child({ flow: 'script' });
    const migrationLog = scriptLogger.child({ flow: 'migration' });

    module.script = scriptLog;
    module.migration = migrationLog;

    return module;
};