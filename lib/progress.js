/**
 * Implements CLI progress bar to monitor the progress of the migration.
 */
const progress = require('cli-progress');
const fs = require('fs');
const readline = require('readline');

async function _countLines_Async(filePath) {
  return new Promise((resolve, reject) => {
    let lineCount = 0;
    const readStream = fs.createReadStream(filePath);
    const lineReader = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity
    });

    lineReader.on('line', () => {
      lineCount++;
    });

    lineReader.on('close', () => {
      resolve(lineCount);
    });

    lineReader.on('error', (err) => {
      reject(err);
    });
  });
}

const _multiBar = new progress.MultiBar({
    clearOnComplete: false,
    hideCursor: true
});
let _statusBar = null;
let _progressBar = null;


async function init_Async(filePath) {
    const fileCount = await _countLines_Async(filePath);
    const totalCount = fileCount - 1; // subtracting the header line
    const init_stats = {
        concurrent: 0,
        succeeded: 0,
        failed: 0
    };
    _progressBar = _multiBar.create(totalCount, 0, init_stats, {
        format: '(🔀{concurrent}) ⏳ [{bar}] ETA: {eta_formatted}',
        fps: 5
    });
    _statusBar = _multiBar.create(totalCount, 0, init_stats, {
        format: 'Attempted: {value} (✅{succeeded} /❌{failed}) out of {total}',
        fps: 5
    });
}


function update(concurrent, attempted, succeeded, failed) {
    _progressBar.update(attempted, { succeeded, failed, concurrent });
    _statusBar.update(attempted, { succeeded, failed, concurrent });
}


function stop() {
    _multiBar.stop();
}

module.exports = {
    init_Async,
    update,
    stop
}