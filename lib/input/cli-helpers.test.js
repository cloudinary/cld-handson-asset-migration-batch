const fs = require('node:fs');
const logging = require('../output/logging');
const reporting = require('../output/reporting');
const { exitIfAlreadyExistsOrCreateNew, inputFileMustExist, ensureDoesNotExceedMax } = require('./cli-helpers');

// Mock fs functions
jest.mock('node:fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
}));

// Mock logging and reporting functions
jest.mock('../output/logging', () => ({
    getLogFilePath: jest.fn(),
}));

jest.mock('../output/reporting', () => ({
    getReportFilePath: jest.fn(),
}));


describe('exitIfAlreadyExistsOrCreateNew', () => {
    beforeEach(() => {
        // Resetting all the mocked functions
        jest.resetAllMocks();
    });

    const folder = 'outputFolder';

    it('should create folder if not exists and no log or report file exist', () => {
        logging.getLogFilePath.mockReturnValue('logPath');
        reporting.getReportFilePath.mockReturnValue('reportPath');
        fs.existsSync.mockReturnValue(false);
        expect(exitIfAlreadyExistsOrCreateNew(folder)).toEqual(folder);
        expect(fs.mkdirSync).toHaveBeenCalledWith(folder, { recursive: true });
    });

    it('should throw error if log or report file already exists', () => {
        logging.getLogFilePath.mockReturnValue('logPath');
        reporting.getReportFilePath.mockReturnValue('reportPath');
        fs.existsSync.mockReturnValueOnce(true);
        expect(() => exitIfAlreadyExistsOrCreateNew(folder)).toThrow();
    });
});

describe('inputFileMustExist', () => {
    beforeEach(() => {
        // Resetting all the mocked functions
        jest.resetAllMocks();
    });

    it('should return path if file exists', () => {
        const filePath = 'filePath';
        fs.existsSync.mockReturnValue(true);
        expect(inputFileMustExist(filePath)).toEqual(filePath);
    });

    it('should throw error if file does not exist', () => {
        const filePath = 'filePath';
        fs.existsSync.mockReturnValue(false);
        expect(() => inputFileMustExist(filePath)).toThrow();
    });
});

describe('ensureDoesNotExceedMax', () => {
    it('should return integer value if in range', () => {
        expect(ensureDoesNotExceedMax('10')).toEqual(10);
    });

    it('should throw error if not a number', () => {
        expect(() => ensureDoesNotExceedMax('not-a-number')).toThrow();
    });

    it('should throw error if less than minimum', () => {
        expect(() => ensureDoesNotExceedMax('0')).toThrow();
    });

    it('should throw error if greater than maximum', () => {
        expect(() => ensureDoesNotExceedMax('21')).toThrow();
    });
});
