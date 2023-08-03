const cloudinary = require('cloudinary').v2;

async function payloadFunc_Async(payloadOptions) {
    console.log(payloadOptions);
}

module.exports = {
    payloadFunc_Async
}