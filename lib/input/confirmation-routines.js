/**
 * @fileoverview This module encapsulates the logic to prompt the user for confirmation. 
 * It can be used to request a 'yes' or 'no' response from the user and to validate user confirmation for a set of migration parameters.
 */

const yesno = require('yesno');
const util = require('node:util');

/**
 * Custom error class representing a scenario where the user did not confirm the proposed action.
 * 
 * @class UserDidNotConfirmError
 * @extends {Error}
 */
class UserDidNotConfirmError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UserDidNotConfirmError';
    }
  }


/**
 * Prompts user to answer a question with yes or no. The function will await the user's response.
 *
 * @async
 * @function confirm_Async
 * @param {string} question - The question to present to the user.
 * @returns {Promise<boolean>} - Resolves to a boolean representing the user's answer.
 */
async function confirm_Async(question) {
    return await yesno({
        question: question + ' (y/n) ',
        defaultValue: null
    });
}

/**
 * Prompts user to confirm the migration operation parameters. If the user confirms, the function simply returns.
 * If the user does not confirm, the function throws a UserDidNotConfirmError.
 *
 * @async
 * @function confirmOperationOptionsOrExit_Async
 * @param {Object} migrationOptions - The set of migration parameters to be confirmed.
 * @throws {UserDidNotConfirmError} - If the user does not confirm the operation parameters.
 */
async function confirmOperationOptionsOrExit_Async(migrationOptions) {
    const migrationOptionsStr = util.inspect(migrationOptions, {depth: null, colors: true});
    const migrationPrompt = 
`❗️WARNING: This script will perform asset migration with the following parameters:
${migrationOptionsStr}

Are you sure you want to proceed?`;

    const promptConfirmed = await confirm_Async(migrationPrompt);
    if (!promptConfirmed) {
        throw new UserDidNotConfirmError('Operation parameters not confirmed. Terminating');
    }
}

module.exports = {
    confirmOperationOptionsOrExit_Async,
    UserDidNotConfirmError
}