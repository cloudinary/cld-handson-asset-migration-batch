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
    const progressLog = scriptLogger.child({ flow: 'progress' });

    module.script = scriptLog;
    module.migration = migrationLog;
    module.progress = progressLog;

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

    return module;
};