const fs = require('node:fs');
const path = require('node:path');
const cloudinary = require('cloudinary').v2;
const { payloadFunc_Async } = require('./migrate.js');

// Mocking the fs.statSync function
fs.statSync = jest.fn();

describe('payloadFunc_Async', () => {
    beforeEach(() => {
        // Resetting all the mocked functions
        jest.resetAllMocks();
    });

    test.each([
        'http://res.cloudinary.com/demo/image/upload/sample.jpg',
        'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        's3://s3-us-west-2.amazonaws.com/cld-s3-test/image/upload/sample.jpg',
        'gs://cld-gs-test/image/upload/sample.jpg',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhQJ/6+gkUQAAAABJRU5ErkJggg==',
        'ftp://ftp.example.com/path/to/file.txt',
    ])('should call upload method for asset ref: %s', async (url) => {
        const payload = {
            file: url,
            options: {}
        };

        // Mocking the cloudinary.uploader.upload method
        cloudinary.uploader.upload = jest.fn();
        cloudinary.uploader.upload.mockResolvedValue('Success');

        const result = await payloadFunc_Async(payload);

        expect(cloudinary.uploader.upload).toHaveBeenCalled();
        expect(result).toEqual('Success');
    });

    it('should call upload method for local files under threshold', async () => {
        const payload = {
            file: path.join('path', 'to', 'local', 'file'),
            options: {}
        };

        fs.statSync.mockReturnValue({ size: 90 * 1024 * 1024 }); // Mocking the file size as 90MB
        cloudinary.uploader.upload.mockResolvedValue('Success');

        const result = await payloadFunc_Async(payload);

        expect(cloudinary.uploader.upload).toHaveBeenCalled();
        expect(cloudinary.uploader.upload).toHaveBeenCalledWith(payload.file, payload.options);
        expect(result).toEqual('Success');
    });

    it('should call upload_large method for large local files over theshold', async () => {
        const payload = {
            file: path.join('path', 'to', 'local', 'file'),
            options: {}
        };

        // Mocking the cloudinary.uploader.upload_large method.
        // Ensuring callback is invoked.
        cloudinary.uploader.upload_large = jest.fn((filePath, options, callback) => {
            callback(null, 'Success');
        });

        fs.statSync.mockReturnValue({ size: 200 * 1024 * 1024 }); // Mocking the file size as 200MB

        const result = await payloadFunc_Async(payload);

        expect(cloudinary.uploader.upload_large).toHaveBeenCalled();
        expect(cloudinary.uploader.upload_large).toHaveBeenCalledWith(payload.file, payload.options, expect.any(Function));
        expect(result).toEqual('Success');
    });
});
