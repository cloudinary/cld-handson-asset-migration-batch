/**
 * @fileoverview This module encapsulates the logic to prompt user to answer a question with yes or no.
 */

const yesno = require('yesno');

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

module.exports = {
    confirm_Async
}