/**
 * @fileoverview This module encapsulates the logic to prompt user to answer a question with yes or no.
 */

const yesno = require('yesno');


class UserDidNotConfirmError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UserDidNotConfirmError';
    }
  }


/**
 * Prompts user to answer a question with yes or no.
 * 
 * @param {string} question - The question to be displayed to the user
 */
async function confirm_Async(question) {
    return await yesno({
        question: question + ' (y/n) ',
        defaultValue: null
    });
}

/**
 * Prompts user to confirm parameters for the migration operation.
 * If confirmed - returns. Otherwise - exits the script.
 * 
 * @param {Object} migrationOptions 
 */
async function confirmOperationOptionsOrExit_Async(migrationOptions) {
    const migrationPrompt = 
`❗️WARNING: This script will perform asset migration with the following parameters:
${JSON.stringify(migrationOptions, null, 2)}

Are you sure you want to proceed?`;

    const promptConfirmed = await confirm_Async(migrationPrompt);
    if (!promptConfirmed) {
        throw new UserDidNotConfirmError('Migration parameters not confirmed. Terminating');
    }
}

module.exports = {
    confirmOperationOptionsOrExit_Async 
}