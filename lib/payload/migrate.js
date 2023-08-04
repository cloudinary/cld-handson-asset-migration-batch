/**
 * @fileoverview Encapsulates the logic for migrating (uploading) files to Cloudinary using Cloudinary Upload API.
 */

const cloudinary = require('cloudinary').v2;

/**
 * Uploads a file to Cloudinary using the provided payload.
 *
 * @param {Object} payload - The payload for the upload operation.
 * @param {string} payload.file - The file reference (supported by Cloudinary Upload API) to be uploaded.
 * @param {Object} payload.options - The options for the upload operation.
 * @returns {Promise<Object>} A promise that resolves to the result of the upload operation.
 */
async function payloadFunc_Async(payload) {
    return await cloudinary.uploader.upload(payload.file, payload.options);
}

module.exports = {
    payloadFunc_Async
}