const testEnv = require('./test-env');

// Global teardown for Jest.
//
// Deletes the .env file for the previously provisioned temp 
// "sandbox" product environment
module.exports = () => { 
    console.log('\nGLOBAL TEARDOWN: START');
    testEnv.teardown(); 
    console.log('GLOBAL TEARDOWN: DONE');
}