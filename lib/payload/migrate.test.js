const fs = require('node:fs');
const path = require('node:path');
const cloudinary = require('cloudinary').v2;
const { payloadFunc_Async } = require('./migrate.js');


describe('payloadFunc_Async', () => {
    let cldUploadSpy = null;
    let cldUploadLargeSpy = null;
    let fsStatSyncSpy = null;
    beforeEach(() => {
        // Using `spyOn` for mocked functions from other modules to prevent side effects
        cldUploadSpy = jest.spyOn(cloudinary.uploader, 'upload');
        cldUploadSpy.mockResolvedValue('Success');

        cldUploadLargeSpy = jest.spyOn(cloudinary.uploader, 'upload_large');
        cldUploadLargeSpy.mockImplementation((filePath, options, callback) => {
            callback(null, 'Success');
        });

        fsStatSyncSpy = jest.spyOn(fs, 'statSync');
    });

    afterEach(() => {
        cldUploadSpy.mockRestore();
        cldUploadLargeSpy.mockRestore();
        fsStatSyncSpy.mockRestore();
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

        const result = await payloadFunc_Async(payload);

        expect(cldUploadSpy).toHaveBeenCalled();
        expect(result).toEqual('Success');
    });

    it('should call upload method for local files under threshold', async () => {
        const payload = {
            file: path.join('path', 'to', 'local', 'file'),
            options: {}
        };

        fsStatSyncSpy.mockReturnValue({ size: 90 * 1024 * 1024 }); // Mocking the file size as 90MB

        const result = await payloadFunc_Async(payload);

        expect(cldUploadSpy).toHaveBeenCalled();
        expect(cldUploadSpy).toHaveBeenCalledWith(payload.file, payload.options);
        expect(result).toEqual('Success');
    });

    it('should call upload_large method for large local files over theshold', async () => {
        const payload = {
            file: path.join('path', 'to', 'local', 'file'),
            options: {}
        };

        fsStatSyncSpy.mockReturnValue({ size: 200 * 1024 * 1024 }); // Mocking the file size as 200MB

        const result = await payloadFunc_Async(payload);

        expect(cldUploadLargeSpy).toHaveBeenCalled();
        expect(cldUploadLargeSpy).toHaveBeenCalledWith(payload.file, payload.options, expect.any(Function));
        expect(result).toEqual('Success');
    });
});
