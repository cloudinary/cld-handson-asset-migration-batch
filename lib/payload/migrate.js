/**
 * @fileoverview Encapsulates the logic for migrating (uploading) files to Cloudinary using Cloudinary Upload API.
 */

const fs = require('node:fs');
const cloudinary = require('cloudinary').v2;

const {
    isRemoteUrl,
} = cloudinary.utils;

// When uploading files from file system (as opposed to URL) defines 
// the size threshold when `upload_large` API method should be used.
const UPLOAD_LARGE_THRESHOLD_BYTES = 100*1024*1024; // 100MB


/**
 * Uploads a file to Cloudinary using the provided payload.
 *
 * @param {Object} payload - The payload for the upload operation.
 * @param {string} payload.file - The file reference (supported by Cloudinary Upload API) to be uploaded.
 * @param {Object} payload.options - The options for the upload operation.
 * @returns {Promise<Object>} A promise that resolves to the result of the upload operation.
 */
async function payloadFunc_Async(payload) {
    const fileRef = payload.file;
    const options = payload.options;
    const uploadMethod_Async = _resolveUploadMethod(fileRef);
    return await uploadMethod_Async(fileRef, options);
}


/**
 * Resolves the appropriate Cloudinary Upload API method to use for uploading the file.
 * 
 * @param {string} fileRef - The file reference (supported by Cloudinary Upload API) to be uploaded.
 * @returns {function} - The Cloudinary Upload API method to use for uploading the file.
 */
function _resolveUploadMethod(fileRef) {
    let uploadMethod = cloudinary.uploader.upload;
    if (!isRemoteUrl(fileRef)) {
        const fileStats = fs.statSync(fileRef);
        if (fileStats.size > UPLOAD_LARGE_THRESHOLD_BYTES) {
            // Using upload_large wrapper for "local" files 
            //   larger than uploadLargeThresholdBytes
            uploadMethod = _uploadLarge_Async;
        }
    }
    return uploadMethod;
}

/**
 * By default upload_large is not async and returns the result of
 * fs.createReadStream(...).pipe(...)
 * 
 * This wrapper makes it async and returns the Cloudinary Upload API response
 * making behavior consistent with the `cloudinary.uploader.upload` method.
 * 
 * @param {string} filePath - path to the file being uploaded
 * @param {object} options - Cloudinary Upload API options
 * @returns {Promise} - Promise that resolves to the Cloudinary Upload API response 
 *                      or rejects with an error
 */
async function _uploadLarge_Async(filePath, options) {
    // Wrapping upload_large in a promise that can be `await`-ed
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(filePath, options, function (err, res) {
            if (err) {
                // Rejecting the promise will cause the `await` to throw the error
                reject(err); 
            } else {
                // Resolving the promise will cause the `await` to return the result
                resolve(res);
            }
        });
    });
}



module.exports = {
    payloadFunc_Async
}