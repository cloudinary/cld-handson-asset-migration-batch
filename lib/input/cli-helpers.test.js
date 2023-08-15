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
let spy = {
    fs : {
        existsSync: null,
        mkdirSync: null,
    },
    logging: {
        getLogFilePath: null,
    },
    reporting: {
        getReportFilePath: null,
    }
};

const setupMocks = () => {
    spy.fs.existsSync = jest.spyOn(fs, 'existsSync');

    spy.fs.mkdirSync = jest.spyOn(fs, 'mkdirSync');
    spy.fs.mkdirSync.mockImplementation(() => {});
    
    spy.logging.getLogFilePath = jest.spyOn(logging, 'getLogFilePath');
    spy.logging.getLogFilePath.mockReturnValue('logPath');

    spy.reporting.getReportFilePath = jest.spyOn(reporting, 'getReportFilePath');
    spy.reporting.getReportFilePath.mockReturnValue('reportPath');
};

const restoreMocksRecursively = (spyObj) => {
    Object.keys(spyObj).forEach(key => {
        if (spyObj[key] !== null && typeof spyObj[key] === 'object') {
            restoreMocksRecursively(spyObj[key]);
        } else {
            spyObj[key].mockRestore();
        }
    });
}
const teardownMocks = () => {
    restoreMocksRecursively(spy);
};


describe('exitIfAlreadyExistsOrCreateNew', () => {
    beforeEach(setupMocks);
    afterEach(teardownMocks);

    const folder = 'outputFolder';

    it('should create folder if not exists and no log or report file exist', () => {
        spy.fs.existsSync.mockReturnValue(false);
        expect(exitIfAlreadyExistsOrCreateNew(folder)).toEqual(folder);
        expect(spy.fs.mkdirSync).toHaveBeenCalledWith(folder, { recursive: true });
    });

    it('should throw error if log or report file already exists', () => {
        spy.fs.existsSync.mockReturnValue(true);
        expect(() => exitIfAlreadyExistsOrCreateNew(folder)).toThrow();
    });
});


describe('inputFileMustExist', () => {
    beforeEach(setupMocks);
    afterEach(teardownMocks);

    it('should return path if file exists', () => {
        const filePath = 'filePath';
        spy.fs.existsSync.mockReturnValue(true);
        expect(inputFileMustExist(filePath)).toEqual(filePath);
    });

    it('should throw error if file does not exist', () => {
        const filePath = 'filePath';
        spy.fs.existsSync.mockReturnValue(false);
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