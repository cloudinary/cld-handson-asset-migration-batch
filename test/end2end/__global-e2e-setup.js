const testEnv = require('./test-env');

// Global setup for Jest.
//
// Provisions new temp "sandbox" product environment before running tests 
module.exports = async () => {
    console.log('\nGLOBAL SETUP: START');
    await testEnv.setupNewSandboxCloud_Async();
    console.log('GLOBAL SETUP: DONE\n');
};

