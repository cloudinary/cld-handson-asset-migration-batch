const fs = require('node:fs');
const logging = require('../output/logging');
const reporting = require('../output/reporting');
const { exitIfAlreadyExistsOrCreateNew, inputFileMustExist, ensureDoesNotExceedMax } = require('./cli-helpers');


// Mock logging and reporting functions
jest.mock('../output/logging', () => ({
    getLogFilePath: jest.fn(),
}));

jest.mock('../output/reporting', () => ({
    getReportFilePath: jest.fn(),
}));


// Re-usable mock setup & teardown functions for the tests
// Ensure minimal interference w/ the fs module
let fsExistsSyncMock;
let fsMkdirSyncMock;
let logging_getLogFilePathMock;
let reporting_getReportFilePathMock;
const setupMocks = () => {
    fsExistsSyncMock = jest.spyOn(fs, 'existsSync');

    fsMkdirSyncMock = jest.spyOn(fs, 'mkdirSync');
    fsMkdirSyncMock.mockImplementation(() => {});
    
    logging_getLogFilePathMock = jest.spyOn(logging, 'getLogFilePath');
    logging_getLogFilePathMock.mockReturnValue('logPath');

    reporting_getReportFilePathMock = jest.spyOn(reporting, 'getReportFilePath');
    reporting_getReportFilePathMock.mockReturnValue('reportPath');
};

const teardownMocks = () => {
    fsExistsSyncMock.mockRestore();
    fsMkdirSyncMock.mockRestore();
    logging_getLogFilePathMock.mockRestore();
    reporting_getReportFilePathMock.mockRestore();
};


describe('exitIfAlreadyExistsOrCreateNew', () => {
    beforeEach(setupMocks);
    afterEach(teardownMocks);

    const folder = 'outputFolder';

    it('should create folder if not exists and no log or report file exist', () => {
        fsExistsSyncMock.mockReturnValue(false);
        expect(exitIfAlreadyExistsOrCreateNew(folder)).toEqual(folder);
        expect(fsMkdirSyncMock).toHaveBeenCalledWith(folder, { recursive: true });
    });

    it('should throw error if log or report file already exists', () => {
        fsExistsSyncMock.mockReturnValue(true);
        expect(() => exitIfAlreadyExistsOrCreateNew(folder)).toThrow();
    });
});


describe('inputFileMustExist', () => {
    beforeEach(setupMocks);
    afterEach(teardownMocks);

    it('should return path if file exists', () => {
        const filePath = 'filePath';
        fsExistsSyncMock.mockReturnValue(true);
        expect(inputFileMustExist(filePath)).toEqual(filePath);
    });

    it('should throw error if file does not exist', () => {
        const filePath = 'filePath';
        fsExistsSyncMock.mockReturnValue(false);
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