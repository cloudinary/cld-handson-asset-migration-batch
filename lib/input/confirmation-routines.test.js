'use strict';

const yesnoMock = require('yesno'); // Assumes yesno module is mocked in __mocks__ directory and exports instance of jest.fn()
const util = require('node:util');
const { confirmOperationOptionsOrExit_Async, UserDidNotConfirmError } = require('./confirmation-routines');

describe('confirmOperationOptionsOrExit_Async', () => {
    afterEach(() => {
        yesnoMock.mockReset();
    });

    it('should confirm the operation when user answers yes', async () => {
        const migrationOptionsMock = { someOption: 'value', someOtherOption: 'otherValue' };
        const migrationOptionsStr = util.inspect(migrationOptionsMock, {depth: null, colors: true});
        const migrationPrompt = 
`❗️WARNING: This script will perform the bulk operation with the following parameters:
${migrationOptionsStr}

Are you sure you want to proceed?`;
        
        yesnoMock.mockResolvedValue(true);

        await expect(confirmOperationOptionsOrExit_Async(migrationOptionsMock)).resolves.not.toThrow();

        expect(yesnoMock).toHaveBeenCalledWith({
            question: migrationPrompt + ' (y/n) ',
            defaultValue: null
        });
    });

    it('should throw UserDidNotConfirmError when user answers no', async () => {
        const migrationOptions = { someOption: 'value' };

        yesnoMock.mockResolvedValue(false);

        await expect(confirmOperationOptionsOrExit_Async(migrationOptions))
            .rejects.toThrow(UserDidNotConfirmError);
    });
});
