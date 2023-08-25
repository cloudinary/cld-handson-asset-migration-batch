#!/usr/bin/env node
/**
 * @fileoverview This is the main entry point for the CLI tool.
 * 
 * 💡 Edit the `__input-to-api-payload.js` module to customize how CSV input is "translated" to Cloudinary API payload
 * 
 * Parsess command line parameters and invokes the main processing loop.
 * 💡 Should you need to edit processing loop - edit the `./lib/main-loop.js` module
 * 
 * Requires CLOUDINARY_URL environment variable to be set (either explicitly or via a .env file)
 * 
 * Produces log file with two types of records: `script` (flow="script") and `payload` (flow="payload").
 * The `payload` records contain:
 *  - input (row from CSV file)
 *  - payload (parameters for Cloudinary API produced from the input)
 *  - response (Cloudinary API response)
 *  - summary (migration operation status and error message if it failed)
 * 
 * `payload` records from the log file are then used to produce the operation report.
 */
const { Command } = require('commander');
const mainLoop = require('./lib/main-loop');
const cliHelpers = require('./lib/input/cli-helpers');
const updateAssetPayload = require('./lib/payload/update');
const migrateAssetPayload = require('./lib/payload/migrate');
const confirmationRoutines = require('./lib/input/confirmation-routines');

//
// Used as help text for the tool
//  
const toolDescription = `
The script can be used to use CSV file as input to:
 * bulk migrate (using Cloudinary Upload API) new assets 
 - OR - 
 * bulk update (using Cloudinary explicit API) existing assets

Implements
 - Memory-efficient processing of large input CSV file
 - Customizeable mapping of CSV records to Cloudinary Upload API parameters -- see the __input-to-api-payload.js module
 - Concurrent uploads (up to the specified limit)
 - Ongoing progress reporting
 - Migration log file (JSONL)
 - Customizeable migration report file (CSV) -- see the __log-to-report.js module

🤓 To prevent unintentional override of log or report files from prior executions, the script does not proceed if the output folder already contains migration log or report files.`

const __program = new Command();

//
// Configure command line arguments shared across all commands
//
function yieldDefaultArgsCommand(program) {
    const defaultArgsCommand = program.createCommand()
        .requiredOption(
            '-f, --from-csv-file <path>', 
            'CSV file detailing assets to import',
            cliHelpers.inpuFileMustExist)
        .requiredOption(
            '-o, --output-folder <path>', 
            'Folder name for the migration log and report files',
            cliHelpers.exitIfAlreadyExistsOrCreateNew)
        .requiredOption(
            '-c, --max-concurrent-uploads <number>', 
            'Max number of concurrent uploads',
            cliHelpers.ensureDoesNotExceedMax)
        .helpOption('-h, --help', 'Display help for command');
    return defaultArgsCommand;
}


/**
 * Configures prorgram parameters exposed to the user via CLI
 * 
 * @param {Command} program 
 */
function configureProgram(program) {
    program
        .name('cld-bulk')
        .description('CLI to bulk-migrate or bulk-update assets in Cloudinary using CSV file as input')
        .version('1.0.0')
}


function configureCommands(program) {
    const migrateCmd = yieldDefaultArgsCommand(program);
    migrateCmd.name('migrate')
        .description('...migrate description...')
        .addHelpCommand(false)
        .showHelpAfterError()
        .allowUnknownOption(false)
        .action(async (cliArgs, cliCommand) => {
            console.log('migrate payload');
            await mainLoop.loopOverCsvInput_Async(
                cliArgs,
                cliCommand,
                migrateAssetPayload,
                confirmationRoutines
            );
        });
    program.addCommand(migrateCmd);
    
    /*const updateCmd = yieldDefaultArgsCommand(program);
    updateCmd.name('update')
        .description('...explicit description...')
        .addHelpCommand(false)
        .showHelpAfterError()
        .allowUnknownOption(false)
        .action(async (cliArgs, cliCommand) => {
            throw new Error('Not implemented');
        });
    program.addCommand(updateCmd);*/
}


configureProgram(__program);
configureCommands(__program);
__program.parse(process.argv);