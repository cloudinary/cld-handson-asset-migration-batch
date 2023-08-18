const fs = require('fs');
const readline = require('readline');

async function parseLogFile_Async(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const logs = [];
    const pubId2LogsIndex = {};

    for await (const line of rl) {
        try {
            const logObj = JSON.parse(line);
            
            // Add parsed log record to logs array, persist the index at which it was added
            const currentLogIndex = logs.push(logObj) - 1;

            // Check if the log has the required structure and add it to the logsByPublicId object
            if (logObj.flow === 'payload' && logObj.payload && logObj.payload.options && logObj.payload.options.public_id) {
                const publicId = logObj.payload.options.public_id;
                if (! pubId2LogsIndex[publicId]) {
                    pubId2LogsIndex[publicId] = [];
                }
                pubId2LogsIndex[publicId].push(currentLogIndex);
            }
        } catch (error) {
            throw `Failed to parse line: '${line}'`;
        }
    }

    return {
        getLength: () => logs.length,
        getEntryByIndex: (index) => logs[index], // There can be only one log entry per index
        getEntriesByPublicId: (publicId) => {
            return pubId2LogsIndex[publicId]
                .map((index) => logs[index]) // But there can be multiple log entries per public_id
        }
    };
}

module.exports = {
    parseLogFile_Async
}
