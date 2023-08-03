const cloudinary = require('cloudinary').v2;

async function payloadFunc_Async(payload) {
    return await cloudinary.uploader.upload(payload.file, payload.options);
}

module.exports = {
    payloadFunc_Async
}