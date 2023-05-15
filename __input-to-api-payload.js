/**
 * @fileoverview This file contains the logic to "translate" each CSV record from input file
 * into Cloudinary Upload API payload.
 */

/**
 * Converts a CSV record from migration input file to a Cloudinary API payload.
 * 
 * Customize this function to suit your needs (e.g. modify upload parameters) as per the Cloudinary Upload API specs:
 * https://cloudinary.com/documentation/image_upload_api_reference#upload
 * 
 * @param {Object} csvRec - CSV record from the migration input file
 * @returns {Object} - parameters for Cloudinary API call
 *  - file: the URL to obtain the asset from
 *  - options: options for the Cloudinary Upload API call
 */
exports.input2ApiPayload = function(csvRec) {
    const file = csvRec.Url;
    const options = {
        public_id: csvRec.Id,
        unique_filename: false,
        resource_type: 'auto',
        type: 'upload',
        tags: csvRec.Tags,
        context: {
            caption: csvRec.Description,
        }
    };

    return { file, options };
}
