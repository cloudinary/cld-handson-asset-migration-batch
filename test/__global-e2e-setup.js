const testEnv = require('./end2end/test-env');
const resources = require('./resources');

// Global setup for Jest.
//
// Provisions new temp "sandbox" product environment before running tests 
module.exports = async () => {
    console.log('\nGLOBAL SETUP: START');
    await testEnv.setupNewSandboxCloud_Async();
    console.log('Downloading large video asset');
    await resources.createLargeVideoTestAsset_Async();
    console.log('GLOBAL SETUP: DONE\n');
};

