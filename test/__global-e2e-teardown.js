const testEnv = require('./end2end/test-env');
const resources = require('./resources');

// Global teardown for Jest.
//
// Deletes the .env file for the previously provisioned temp 
// "sandbox" product environment
module.exports = async () => { 
    console.log('\nGLOBAL TEARDOWN: START');
    testEnv.teardown();
    console.log('Deleting large video asset');
    await resources.cleanupLargeVideoTestAsset_Async();
    console.log('GLOBAL TEARDOWN: DONE');
}