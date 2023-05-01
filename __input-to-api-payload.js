/**
 * @fileoverview This file contains the functions to create the Cloudinary API payload from a CSV record.
 */

/**
 * Converts a CSV record from migration input file to a Cloudinary API payload.
 * 
 * Customize this function to suit your needs (e.g. modify upload parameters).
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
